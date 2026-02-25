import { motion, AnimatePresence } from "framer-motion";
import { FileText, Trash2, Loader2, AlertCircle } from "lucide-react";
import type { Document } from "@/types";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const statusIcon = {
  processing: <Loader2 size={10} className="animate-spin text-yellow-400" />,
  error: <AlertCircle size={10} className="text-red-400" />,
  ready: null,
};

export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-[10px] text-gray-500 text-center py-3">
        Belum ada dokumen.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group"
          >
            <FileText size={13} className="text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-300 truncate">{doc.filename}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <span>{formatFileSize(doc.file_size)}</span>
                <span>&middot;</span>
                <span>{doc.chunk_count} chunks</span>
                {statusIcon[doc.status]}
              </div>
            </div>
            <motion.button
              onClick={() => onDelete(doc.id)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
            >
              <Trash2 size={12} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
