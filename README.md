# Legal Chatbot

Chatbot RAG (Retrieval-Augmented Generation) untuk departemen legal. Full on-premise: frontend React + TypeScript, backend FastAPI, LLM & embedding via Ollama. Data tetap di server internal.

## Fitur

- Chat dengan dokumen legal (summary + tabel terstruktur)
- Upload dokumen: PDF, DOCX, CSV, Excel, TXT, Markdown
- Riwayat chat per session
- Sumber referensi (source citation) per jawaban
- Cache response (Redis) untuk pertanyaan berulang
- UI responsif + animasi (Framer Motion)

## Persiapan

### 1. Ollama (Local LLM)

Install [Ollama](https://ollama.com), lalu pull model:

```bash
ollama pull qwen2.5:3b
ollama pull bge-m3
```

Untuk laptop dengan GPU terbatas (mis. RTX 3050 Ti) pakai `qwen2.5:3b`. Untuk server lebih kuat bisa pakai `qwen2.5:7b` atau `qwen2.5:14b`.

### 2. Redis (opsional, untuk cache)

```bash
# Windows (via Docker)
docker run -d -p 6379:6379 redis:7-alpine

# Atau install Redis lokal. Kalau tidak jalan, chatbot tetap berfungsi tanpa cache.
```

### 3. Environment

- **Backend**: copy `backend/.env.example` jadi `backend/.env`. Sesuaikan jika perlu (default sudah untuk development).
- **Frontend**: tidak perlu .env untuk development (proxy ke backend lewat Vite).

## Menjalankan

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs  
Health: http://localhost:8000/api/health

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173. Request ke `/api` akan di-proxy ke backend (port 8000).

## Struktur Singkat

- `frontend/` — React 18 + TypeScript + Vite + Tailwind + Framer Motion
- `backend/app/` — FastAPI, RAG (LangChain + ChromaDB), Ollama, Redis, SQLite
- `backend/data/` — uploads, ChromaDB, SQLite (auto-created)

## Template Response

Format response (summary + table) bisa diubah di `backend/app/core/response_templates.py` tanpa ubah logic. Detail kolom tabel bisa disesuaikan setelah ada template final dari departemen legal.

## Lisensi

Internal use — departemen legal.
