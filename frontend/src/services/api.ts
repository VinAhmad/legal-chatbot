import axios, { type AxiosError } from "axios";
import type {
  ChatRequest,
  ChatResponse,
  ChatSession,
  Document,
  UploadResponse,
} from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120_000,
});

function getErrorMessage(err: AxiosError): string {
  const data = err.response?.data as { detail?: string | { msg?: string }[] } | undefined;
  if (data && typeof data.detail === "string") return data.detail;
  if (data && Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  if (err.code === "ECONNABORTED") return "Request timeout. Coba lagi.";
  if (err.message?.includes("Network")) return "Koneksi gagal. Pastikan backend berjalan.";
  return err.response?.status === 503
    ? "Service sibuk. Pastikan Ollama dan backend berjalan."
    : "Terjadi kesalahan. Coba lagi.";
}

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    err.message = getErrorMessage(err);
    return Promise.reject(err);
  }
);

export const chatApi = {
  send: async (request: ChatRequest): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>("/chat", request);
    return data;
  },

  getSessions: async (): Promise<ChatSession[]> => {
    const { data } = await api.get<ChatSession[]>("/chat/sessions");
    return data;
  },

  getHistory: async (sessionId: string) => {
    const { data } = await api.get(`/chat/sessions/${sessionId}/messages`);
    return data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/chat/sessions/${sessionId}`);
  },
};

export const documentApi = {
  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<UploadResponse>("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000,
    });
    return data;
  },

  list: async (): Promise<Document[]> => {
    const { data } = await api.get<Document[]>("/documents");
    return data;
  },

  delete: async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },
};

export default api;
