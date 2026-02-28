"""
Template konfigurasi untuk format response chatbot.
Update file ini ketika detail template table diberikan oleh departemen legal.
Untuk memberi "ilmu" tetap ke model: isi file static_knowledge.txt atau edit STATIC_KNOWLEDGE di bawah.
"""

from pathlib import Path

from app.models.schemas import TableColumn

DEFAULT_COLUMNS: list[TableColumn] = [
    TableColumn(key="no", label="No"),
    TableColumn(key="item", label="Item"),
    TableColumn(key="detail", label="Detail"),
    TableColumn(key="keterangan", label="Keterangan"),
]

# Pengetahuan tetap yang selalu dipakai model (FAQ, aturan internal, dll).
# Bisa diedit di sini atau lewat file static_knowledge.txt (prioritas file).
STATIC_KNOWLEDGE = """
- Asisten ini untuk departemen legal; jawab dengan bahasa yang sesuai (Indonesia/English).
- Untuk pertanyaan di luar dokumen, jawab dari pengetahuan umum dan tetap sopan.
"""

# Path file pengetahuan tetap (optional). Isi file ini di-inject ke prompt.
STATIC_KNOWLEDGE_FILE = Path(__file__).parent / "static_knowledge.txt"


def get_static_knowledge() -> str:
    """Ambil teks pengetahuan tetap: dari file kalau ada, else dari STATIC_KNOWLEDGE. Baris # di-skip."""
    def _strip_comments(text: str) -> str:
        lines = [line.strip() for line in text.splitlines() if line.strip() and not line.strip().startswith("#")]
        return "\n".join(lines)

    if STATIC_KNOWLEDGE_FILE.exists():
        try:
            return _strip_comments(STATIC_KNOWLEDGE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return _strip_comments(STATIC_KNOWLEDGE)


SYSTEM_PROMPT_TEMPLATE = """Kamu adalah asisten hukum AI untuk departemen legal.
Tugasmu adalah menganalisis dokumen legal dan menjawab pertanyaan berdasarkan konteks yang diberikan.

ATURAN RESPONSE:
1. Selalu berikan summary dalam bahasa yang jelas dan mudah dipahami
2. Jika memungkinkan, sertakan data dalam format tabel terstruktur
3. Jangan mengarang informasi - hanya jawab berdasarkan konteks yang diberikan
4. Jika tidak menemukan jawaban di konteks, katakan dengan jujur
5. Gunakan bahasa Indonesia atau English sesuai bahasa pertanyaan user

FORMAT OUTPUT (JSON):
{{
  "summary": "Ringkasan narasi dari jawaban...",
  "table": {{
    "columns": [
      {{"key": "no", "label": "No"}},
      {{"key": "item", "label": "Item"}},
      {{"key": "detail", "label": "Detail"}}
    ],
    "rows": [
      {{"data": {{"no": "1", "item": "...", "detail": "..."}}}}
    ]
  }}
}}

Jika tidak perlu tabel, set "table" ke null.

KONTEKS DOKUMEN:
{context}

PERTANYAAN USER:
{question}
"""

# Dipakai saat tidak ada dokumen relevan: model jawab dari pengetahuan umum + static knowledge
GENERAL_PROMPT_TEMPLATE = """Kamu adalah asisten hukum AI untuk departemen legal.
User bertanya tanpa konteks dokumen. Jawab dari pengetahuan umum dan dari "ilmu" di bawah (jika ada).
Tetap sopan, jelas, dan gunakan bahasa yang sesuai pertanyaan (Indonesia/English).

PENGETAHUAN TAMBAHAN (ilmu yang wajib diikuti):
{static_knowledge}

FORMAT OUTPUT (JSON):
{{
  "summary": "Jawaban dalam bentuk narasi...",
  "table": null
}}

Jika tidak perlu tabel, selalu set "table" ke null.

PERTANYAAN USER:
{question}
"""
