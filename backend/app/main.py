import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import chat, documents
from app.api.deps import rag_engine, database
from app.db.redis_client import close_redis

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown events."""
    logger.info("Starting Legal Chatbot API...")
    await database.initialize()
    rag_engine.initialize()
    logger.info("All services ready")
    yield
    await close_redis()
    logger.info("Shutdown complete")


app = FastAPI(
    title="Legal Chatbot API",
    description="RAG-based chatbot untuk departemen legal (full on-premise)",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(documents.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    from app.services.embedding_service import EmbeddingService
    embedding_svc = EmbeddingService()
    ollama_ok = await embedding_svc.health_check()
    return {
        "status": "ok",
        "version": "0.1.0",
        "ollama_connected": ollama_ok,
        "vector_store_count": rag_engine.vector_store.count() if rag_engine.vector_store else 0,
    }
