"""Business logic untuk chat: manage sessions, history, dan RAG query."""

import uuid
import logging
import tempfile
import os
from pathlib import Path

from app.core.rag_engine import RAGEngine
from app.db.database import Database

logger = logging.getLogger(__name__)


class ChatService:
    """Orchestrate chat flow: session management + RAG query + history."""

    def __init__(self, rag_engine: RAGEngine, database: Database):
        self.rag = rag_engine
        self.db = database

    async def process_message(self, message: str, session_id: str | None = None) -> dict:
        """
        Proses pesan user:
        1. Buat/pakai session (title = topik dari LLM)
        2. Simpan pesan user ke history
        3. Query RAG
        4. Simpan response ke history
        5. Return response
        """
        if not session_id:
            title = await self.rag.generate_topic_title(message)
            session_id = await self.db.create_session(title)

        await self.db.save_message(session_id, "user", message)
        await self.db.update_session_time(session_id)

        result = await self.rag.query(message)

        msg_id = await self.db.save_message(
            session_id,
            "assistant",
            result["summary"],
            table_data=result.get("table"),
            sources=result.get("sources"),
        )

        return {
            "message_id": msg_id,
            "session_id": session_id,
            "summary": result["summary"],
            "table": result.get("table"),
            "sources": result.get("sources", []),
        }

    async def process_message_with_files(
        self, message: str, session_id: str | None, files: list[tuple[bytes, str]]
    ) -> dict:
        """
        Proses pesan dengan file lampiran sebagai referensi (sekali pakai, tidak masuk knowledge base).
        files: list of (file_content_bytes, filename).
        """
        if not session_id:
            title = await self.rag.generate_topic_title(message)
            session_id = await self.db.create_session(title)

        await self.db.save_message(session_id, "user", message)
        await self.db.update_session_time(session_id)

        temp_paths: list[tuple[str, str]] = []
        try:
            for content, filename in files:
                ext = Path(filename).suffix or ".bin"
                fd, path = tempfile.mkstemp(suffix=ext, prefix="chat_attach_")
                os.close(fd)
                Path(path).write_bytes(content)
                temp_paths.append((path, filename))
            result = await self.rag.query_with_attached_files(message, temp_paths)
        finally:
            for path, _ in temp_paths:
                try:
                    os.unlink(path)
                except OSError:
                    pass

        msg_id = await self.db.save_message(
            session_id,
            "assistant",
            result["summary"],
            table_data=result.get("table"),
            sources=result.get("sources"),
        )
        return {
            "message_id": msg_id,
            "session_id": session_id,
            "summary": result["summary"],
            "table": result.get("table"),
            "sources": result.get("sources", []),
        }

    async def get_sessions(self) -> list[dict]:
        return await self.db.get_sessions()

    async def get_messages(self, session_id: str) -> list[dict]:
        return await self.db.get_messages(session_id)

    async def delete_session(self, session_id: str):
        await self.db.delete_session(session_id)
