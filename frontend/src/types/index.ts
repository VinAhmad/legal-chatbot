export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  table?: TableData | null;
  sources?: SourceReference[];
  timestamp: string;
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface TableRow {
  data: Record<string, string>;
}

export interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

export interface SourceReference {
  document_name: string;
  page?: number;
  chunk_text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  chunk_count: number;
  status: "processing" | "ready" | "error";
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  message_id: string;
  session_id?: string | null;
  summary: string;
  table?: TableData | null;
  sources: SourceReference[];
}

export interface UploadResponse {
  id: string;
  filename: string;
  status: string;
  chunk_count: number;
}
