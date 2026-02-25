"""Dependency injection: singleton instances untuk semua services."""

from app.core.rag_engine import RAGEngine
from app.services.chat_service import ChatService
from app.db.database import Database

database = Database()
rag_engine = RAGEngine()
chat_service = ChatService(rag_engine=rag_engine, database=database)


def get_rag_engine() -> RAGEngine:
    return rag_engine


def get_chat_service() -> ChatService:
    return chat_service


def get_database() -> Database:
    return database
