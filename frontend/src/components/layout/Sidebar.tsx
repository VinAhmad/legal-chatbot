import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Scale, Trash2, Sparkles } from "lucide-react";
import type { ChatSession, Document } from "@/types";
import UploadForm from "../documents/UploadForm";
import DocumentList from "../documents/DocumentList";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  documents: Document[];
  isUploading: boolean;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpload: (file: File) => void;
  onDeleteDocument: (id: string) => void;
}

const itemVariants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export default function Sidebar({
  sessions,
  currentSessionId,
  documents,
  isUploading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onUpload,
  onDeleteDocument,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-gray-900 text-white flex flex-col h-full relative overflow-hidden">
      {/* Glow di sidebar */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="p-4 border-b border-gray-800 relative z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <Scale size={16} className="text-white" />
          </motion.div>
          <div>
            <h1 className="font-bold text-sm">Legal Chatbot</h1>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <Sparkles size={8} className="text-blue-400" />
              AI Assistant
            </p>
          </div>
        </div>
        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                     bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                     text-sm font-medium shadow-md shadow-blue-600/25
                     transition-all duration-200"
        >
          <Plus size={16} />
          Chat Baru
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 relative z-10">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 px-1 font-semibold">
          Riwayat Chat
        </p>
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {sessions.map((session, idx) => {
              const isActive = session.id === currentSessionId;
              return (
                <motion.div
                  key={session.id}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25, delay: idx * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  layout
                  whileHover={{ x: 3 }}
                  className={`group relative flex items-center gap-1 rounded-xl transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/30"
                      : "hover:bg-gray-800/70 border border-transparent"}`}
                >
                  {/* Glow aktif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute -left-0.5 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-blue-400 to-indigo-500"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left text-sm min-w-0 rounded-xl
                      ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}
                  >
                    <MessageSquare size={14} className={`shrink-0 ${isActive ? "text-blue-400" : ""}`} />
                    <span className="truncate">{session.title}</span>
                  </button>
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    className="p-1.5 mr-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Hapus riwayat"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {sessions.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-gray-600 text-center py-8"
            >
              Belum ada riwayat chat
            </motion.p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 p-3 relative z-10">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 px-1 font-semibold">
          Dokumen
        </p>
        <UploadForm onUpload={onUpload} isUploading={isUploading} />
        <div className="mt-2.5 max-h-44 overflow-y-auto">
          <DocumentList documents={documents} onDelete={onDeleteDocument} />
        </div>
      </div>
    </aside>
  );
}
