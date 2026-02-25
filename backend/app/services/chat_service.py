"""Business logic untuk chat: manage sessions, history, dan RAG query."""

import uuid
import logging

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
        1. Buat/pakai session
        2. Simpan pesan user ke history
        3. Query RAG
        4. Simpan response ke history
        5. Return response
        """
        if not session_id:
            title = message[:50] + ("..." if len(message) > 50 else "")
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

    async def get_sessions(self) -> list[dict]:
        return await self.db.get_sessions()

    async def get_messages(self, session_id: str) -> list[dict]:
        return await self.db.get_messages(session_id)

    async def delete_session(self, session_id: str):
        await self.db.delete_session(session_id)
