"""SQLite database untuk chat sessions dan message history."""

import uuid
import json
import aiosqlite
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

DB_PATH = "./data/chat_history.db"


class Database:
    """Async SQLite database manager."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    async def initialize(self):
        """Buat tabel kalau belum ada."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    table_data TEXT,
                    sources TEXT,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    filename TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    uploaded_at TEXT NOT NULL,
                    chunk_count INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'processing'
                )
            """)
            await db.commit()
        logger.info("Database initialized")

    async def create_session(self, title: str) -> str:
        """Buat session baru, return session ID."""
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
                (session_id, title, now, now),
            )
            await db.commit()
        return session_id

    async def get_sessions(self) -> list[dict]:
        """Ambil semua sessions, urut dari terbaru."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM sessions ORDER BY updated_at DESC")
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def update_session_time(self, session_id: str):
        """Update waktu terakhir session dipakai."""
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("UPDATE sessions SET updated_at = ? WHERE id = ?", (now, session_id))
            await db.commit()

    async def delete_session(self, session_id: str):
        """Hapus session dan semua messages-nya."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            await db.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
            await db.commit()

    async def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        table_data: dict | None = None,
        sources: list[dict] | None = None,
    ) -> str:
        """Simpan message, return message ID."""
        msg_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO messages (id, session_id, role, content, table_data, sources, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    msg_id,
                    session_id,
                    role,
                    content,
                    json.dumps(table_data, ensure_ascii=False) if table_data else None,
                    json.dumps(sources, ensure_ascii=False) if sources else None,
                    now,
                ),
            )
            await db.commit()
        return msg_id

    async def get_messages(self, session_id: str) -> list[dict]:
        """Ambil semua messages dari session tertentu."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC",
                (session_id,),
            )
            rows = await cursor.fetchall()
            messages = []
            for row in rows:
                msg = dict(row)
                msg["table"] = json.loads(msg.pop("table_data")) if msg.get("table_data") else None
                msg["sources"] = json.loads(msg["sources"]) if msg.get("sources") else []
                messages.append(msg)
            return messages

    # --- Document metadata ---

    async def add_document(self, doc_id: str, filename: str, file_type: str, file_size: int) -> None:
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO documents (id, filename, file_type, file_size, uploaded_at) VALUES (?, ?, ?, ?, ?)",
                (doc_id, filename, file_type, file_size, now),
            )
            await db.commit()

    async def update_document_status(self, doc_id: str, status: str, chunk_count: int = 0) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE documents SET status = ?, chunk_count = ? WHERE id = ?",
                (status, chunk_count, doc_id),
            )
            await db.commit()

    async def get_documents(self) -> list[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM documents ORDER BY uploaded_at DESC")
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def delete_document(self, doc_id: str) -> dict | None:
        """Hapus dokumen, return info dokumen yang dihapus."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
            doc = await cursor.fetchone()
            if doc:
                await db.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
                await db.commit()
                return dict(doc)
            return None
