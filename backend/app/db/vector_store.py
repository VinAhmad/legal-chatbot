"""ChromaDB vector store untuk simpan dan cari dokumen berdasarkan embedding similarity."""

import logging
import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "legal_documents"


class VectorStore:
    """Wrapper untuk ChromaDB: simpan dan cari dokumen chunks."""

    def __init__(self, persist_dir: str = str(settings.chroma_path)):
        self.persist_dir = persist_dir
        self._client = chromadb.PersistentClient(
            path=persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._collection = self._client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"ChromaDB initialized, collection '{COLLECTION_NAME}' has {self._collection.count()} documents")

    def add_documents(
        self,
        ids: list[str],
        texts: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict],
    ) -> None:
        """Simpan dokumen chunks ke vector store."""
        self._collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        logger.info(f"Added {len(ids)} chunks to vector store")

    def search(self, query_embedding: list[float], top_k: int = 5) -> list[dict]:
        """Cari chunks yang paling relevan berdasarkan cosine similarity."""
        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        matches = []
        if results["documents"] and results["documents"][0]:
            for i in range(len(results["documents"][0])):
                matches.append({
                    "text": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else 0,
                })
        return matches

    def delete_by_source(self, source: str) -> None:
        """Hapus semua chunks dari dokumen tertentu berdasarkan source filename."""
        self._collection.delete(where={"source": source})
        logger.info(f"Deleted chunks with source: {source}")

    def count(self) -> int:
        """Total jumlah chunks di vector store."""
        return self._collection.count()
