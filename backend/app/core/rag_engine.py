"""RAG pipeline: orchestrator untuk embedding, retrieval, generation, dan caching."""

import json
import uuid
import logging
import httpx

from app.core.config import settings
from app.core.response_templates import SYSTEM_PROMPT_TEMPLATE
from app.services.embedding_service import EmbeddingService
from app.services.cache_service import CacheService
from app.services.document_processor import DocumentProcessor
from app.db.vector_store import VectorStore

logger = logging.getLogger(__name__)


class RAGEngine:
    """Orchestrator: document ingestion + query pipeline."""

    def __init__(self):
        self._initialized = False
        self.embedding_service: EmbeddingService | None = None
        self.vector_store: VectorStore | None = None
        self.cache_service: CacheService | None = None

    def initialize(self):
        """Setup semua services. Panggil sekali saat app startup."""
        if self._initialized:
            return
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()
        self.cache_service = CacheService()
        self._initialized = True
        logger.info("RAG Engine initialized")

    async def add_document(self, file_path: str, filename: str) -> int:
        """Proses dokumen: parse -> chunk -> embed -> simpan ke vector store."""
        self._ensure_initialized()

        chunks = await DocumentProcessor.process(file_path, filename)
        if not chunks:
            logger.warning(f"No chunks extracted from {filename}")
            return 0

        texts = [c.text for c in chunks]
        metadatas = [c.metadata for c in chunks]
        ids = [str(uuid.uuid4()) for _ in chunks]

        embeddings = await self.embedding_service.embed_batch(texts)

        self.vector_store.add_documents(
            ids=ids,
            texts=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        await self.cache_service.invalidate_all()

        logger.info(f"Document '{filename}' processed: {len(chunks)} chunks")
        return len(chunks)

    async def query(self, question: str) -> dict:
        """
        Proses pertanyaan user:
        1. Cek cache
        2. Embed pertanyaan
        3. Search vector store
        4. Generate jawaban via Ollama LLM
        5. Simpan ke cache
        """
        self._ensure_initialized()

        cached = await self.cache_service.get(question)
        if cached:
            return cached

        query_embedding = await self.embedding_service.embed_text(question)

        search_results = self.vector_store.search(query_embedding, top_k=5)

        if not search_results:
            return {
                "summary": "Maaf, saya tidak menemukan informasi yang relevan di dokumen yang tersedia. "
                           "Silakan upload dokumen terlebih dahulu atau coba pertanyaan yang berbeda.",
                "table": None,
                "sources": [],
            }

        context = self._build_context(search_results)
        prompt = SYSTEM_PROMPT_TEMPLATE.format(context=context, question=question)

        llm_response = await self._call_ollama(prompt)
        parsed = self._parse_llm_response(llm_response)

        sources = []
        for result in search_results[:3]:
            sources.append({
                "document_name": result["metadata"].get("source", "Unknown"),
                "page": result["metadata"].get("page"),
                "chunk_text": result["text"][:200],
            })
        parsed["sources"] = sources

        await self.cache_service.set(question, parsed)

        return parsed

    async def delete_document(self, filename: str):
        """Hapus dokumen dari vector store dan invalidate cache."""
        self._ensure_initialized()
        self.vector_store.delete_by_source(filename)
        await self.cache_service.invalidate_all()
        logger.info(f"Document '{filename}' removed from vector store")

    def _build_context(self, search_results: list[dict]) -> str:
        """Gabungkan search results jadi satu context string."""
        context_parts = []
        for i, result in enumerate(search_results, 1):
            source = result["metadata"].get("source", "Unknown")
            page = result["metadata"].get("page", "?")
            context_parts.append(
                f"[Dokumen {i}: {source}, Hal. {page}]\n{result['text']}"
            )
        return "\n\n---\n\n".join(context_parts)

    async def _call_ollama(self, prompt: str) -> str:
        """Panggil Ollama LLM API untuk generate jawaban."""
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.llm_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "num_predict": 2048,
                    },
                },
            )
            response.raise_for_status()
            return response.json()["response"]

    def _parse_llm_response(self, raw_response: str) -> dict:
        """Parse response LLM (harusnya JSON). Fallback ke plain text kalau gagal parse."""
        cleaned = raw_response.strip()

        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            parsed = json.loads(cleaned)
            return {
                "summary": parsed.get("summary", cleaned),
                "table": parsed.get("table"),
                "sources": [],
            }
        except json.JSONDecodeError:
            logger.warning("LLM response bukan valid JSON, pakai sebagai plain text")
            return {
                "summary": raw_response.strip(),
                "table": None,
                "sources": [],
            }

    def _ensure_initialized(self):
        if not self._initialized:
            raise RuntimeError("RAG Engine belum di-initialize. Panggil initialize() dulu.")
