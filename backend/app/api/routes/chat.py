import httpx
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, ChatSessionResponse, MessageResponse
from app.api.deps import get_chat_service
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
):
    """Kirim pesan dan dapatkan response dari chatbot."""
    try:
        result = await chat_service.process_message(
            message=request.message,
            session_id=request.session_id,
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Ollama tidak berjalan. Jalankan aplikasi Ollama, lalu ketik: ollama pull qwen2.5:3b dan ollama pull bge-m3",
        )
    return ChatResponse(
        message_id=result["message_id"],
        session_id=result.get("session_id"),
        summary=result["summary"],
        table=result.get("table"),
        sources=result.get("sources", []),
    )


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def get_sessions(
    chat_service: ChatService = Depends(get_chat_service),
):
    """Ambil semua chat sessions."""
    return await chat_service.get_sessions()


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_session_messages(
    session_id: str,
    chat_service: ChatService = Depends(get_chat_service),
):
    """Ambil semua messages dari session tertentu."""
    return await chat_service.get_messages(session_id)


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    chat_service: ChatService = Depends(get_chat_service),
):
    """Hapus chat session beserta semua message-nya."""
    await chat_service.delete_session(session_id)
    return {"status": "ok"}
