import uuid
import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from app.models.schemas import DocumentResponse, UploadResponse
from app.core.config import settings
from app.api.deps import get_rag_engine, get_database
from app.core.rag_engine import RAGEngine
from app.db.database import Database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])


async def _process_document_background(
    file_path: str,
    filename: str,
    doc_id: str,
    rag_engine: RAGEngine,
    database: Database,
):
    """Background task: proses dokumen dan update status di database."""
    try:
        chunk_count = await rag_engine.add_document(file_path, filename)
        await database.update_document_status(doc_id, "ready", chunk_count)
        logger.info(f"Document {filename} processed: {chunk_count} chunks")
    except Exception as e:
        logger.error(f"Failed to process {filename}: {e}")
        await database.update_document_status(doc_id, "error", 0)


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    rag_engine: RAGEngine = Depends(get_rag_engine),
    database: Database = Depends(get_database),
):
    """Upload dokumen, proses di background."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename tidak boleh kosong")

    allowed_extensions = {".pdf", ".docx", ".csv", ".xlsx", ".xls", ".txt", ".md"}
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Format file tidak didukung. Gunakan: {', '.join(allowed_extensions)}",
        )

    content = await file.read()
    file_size = len(content)
    if file_size > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Ukuran file melebihi {settings.max_file_size_mb}MB")

    doc_id = str(uuid.uuid4())
    file_path = settings.upload_path / f"{doc_id}{ext}"
    file_path.write_bytes(content)

    await database.add_document(doc_id, file.filename, ext, file_size)

    background_tasks.add_task(
        _process_document_background,
        str(file_path),
        file.filename,
        doc_id,
        rag_engine,
        database,
    )

    return UploadResponse(
        id=doc_id,
        filename=file.filename,
        status="processing",
        chunk_count=0,
    )


@router.get("", response_model=list[DocumentResponse])
async def list_documents(database: Database = Depends(get_database)):
    """Ambil daftar semua dokumen."""
    return await database.get_documents()


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    rag_engine: RAGEngine = Depends(get_rag_engine),
    database: Database = Depends(get_database),
):
    """Hapus dokumen dari database dan vector store."""
    doc = await database.delete_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    await rag_engine.delete_document(doc["filename"])

    file_path = settings.upload_path / f"{document_id}{doc['file_type']}"
    if file_path.exists():
        os.remove(file_path)

    return {"status": "ok"}
