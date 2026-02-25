"""Redis caching untuk response chatbot. Graceful fallback kalau Redis down."""

import json
import hashlib
import logging

from app.db.redis_client import get_redis
from app.core.config import settings

logger = logging.getLogger(__name__)

CACHE_PREFIX = "legal_chat:"


def _make_cache_key(question: str) -> str:
    """Buat cache key dari pertanyaan (normalize dulu: lowercase, strip)."""
    normalized = question.lower().strip()
    question_hash = hashlib.sha256(normalized.encode()).hexdigest()[:16]
    return f"{CACHE_PREFIX}{question_hash}"


class CacheService:
    """Redis-based caching. Kalau Redis down, semua operasi return None (no-op)."""

    def __init__(self, ttl: int = settings.cache_ttl_seconds):
        self.ttl = ttl

    async def get(self, question: str) -> dict | None:
        """Cek cache. Return dict response kalau ada, None kalau miss atau Redis down."""
        redis = await get_redis()
        if not redis:
            return None
        try:
            key = _make_cache_key(question)
            cached = await redis.get(key)
            if cached:
                logger.info(f"Cache HIT for key: {key}")
                return json.loads(cached)
            return None
        except Exception as e:
            logger.warning(f"Cache get error: {e}")
            return None

    async def set(self, question: str, response: dict) -> None:
        """Simpan response ke cache dengan TTL."""
        redis = await get_redis()
        if not redis:
            return
        try:
            key = _make_cache_key(question)
            await redis.set(key, json.dumps(response, ensure_ascii=False), ex=self.ttl)
            logger.info(f"Cache SET for key: {key}, TTL: {self.ttl}s")
        except Exception as e:
            logger.warning(f"Cache set error: {e}")

    async def invalidate_all(self) -> None:
        """Clear semua cache chatbot (dipanggil saat dokumen baru di-upload)."""
        redis = await get_redis()
        if not redis:
            return
        try:
            cursor = 0
            deleted = 0
            while True:
                cursor, keys = await redis.scan(cursor, match=f"{CACHE_PREFIX}*", count=100)
                if keys:
                    await redis.delete(*keys)
                    deleted += len(keys)
                if cursor == 0:
                    break
            logger.info(f"Cache invalidated: {deleted} keys deleted")
        except Exception as e:
            logger.warning(f"Cache invalidate error: {e}")
