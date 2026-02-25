"""Generate embeddings menggunakan Ollama (bge-m3 model) secara lokal."""

import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

BATCH_SIZE = 32


class EmbeddingService:
    """Generate embedding vectors via Ollama REST API."""

    def __init__(
        self,
        model: str = settings.embedding_model,
        base_url: str = settings.ollama_base_url,
    ):
        self.model = model
        self.base_url = base_url.rstrip("/")

    async def embed_text(self, text: str) -> list[float]:
        """Generate embedding vector dari satu teks."""
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/api/embed",
                json={"model": self.model, "input": text},
            )
            response.raise_for_status()
            data = response.json()
            return data["embeddings"][0]

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings dari batch teks. Split jadi sub-batches biar stabil."""
        all_embeddings = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/embed",
                    json={"model": self.model, "input": batch},
                )
                response.raise_for_status()
                data = response.json()
                all_embeddings.extend(data["embeddings"])
            logger.info(f"Embedded batch {i // BATCH_SIZE + 1}, total: {len(all_embeddings)}/{len(texts)}")
        return all_embeddings

    async def health_check(self) -> bool:
        """Cek apakah Ollama running dan model tersedia."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                resp.raise_for_status()
                models = [m["name"] for m in resp.json().get("models", [])]
                base_model = self.model.split(":")[0]
                return any(base_model in m for m in models)
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return False
