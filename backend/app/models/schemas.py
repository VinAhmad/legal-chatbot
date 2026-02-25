from pydantic import BaseModel
from datetime import datetime


class TableColumn(BaseModel):
    key: str
    label: str


class TableRow(BaseModel):
    data: dict[str, str]


class TableData(BaseModel):
    columns: list[TableColumn]
    rows: list[TableRow]


class SourceReference(BaseModel):
    document_name: str
    page: int | None = None
    chunk_text: str


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    message_id: str
    session_id: str | None = None
    summary: str
    table: TableData | None = None
    sources: list[SourceReference] = []


class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    uploaded_at: str
    chunk_count: int
    status: str


class UploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    chunk_count: int


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    table: TableData | None = None
    sources: list[SourceReference] = []
    timestamp: str
