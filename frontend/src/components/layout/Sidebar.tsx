import { motion } from "framer-motion";
import { Plus, MessageSquare, Scale, Trash2 } from "lucide-react";
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
    <aside className="w-72 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Scale size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Legal Chatbot</h1>
            <p className="text-[10px] text-gray-500">AI Assistant</p>
          </div>
        </div>
        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                     bg-blue-600 hover:bg-blue-500 text-sm font-medium shadow-md shadow-blue-600/20
                     transition-colors"
        >
          <Plus size={16} />
          Chat Baru
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 px-1 font-semibold">
          Riwayat Chat
        </p>
        <div className="space-y-0.5">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ x: 2 }}
              className={`group flex items-center gap-1 rounded-lg transition-all
                ${session.id === currentSessionId ? "bg-gray-800 border-l-2 border-blue-500" : "hover:bg-gray-800/60"}`}
            >
              <button
                type="button"
                onClick={() => onSelectSession(session.id)}
                className={`flex-1 flex items-center gap-2 px-3 py-2.5 text-left text-sm min-w-0
                  ${session.id === currentSessionId ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}
              >
                <MessageSquare size={14} className="flex-shrink-0" />
                <span className="truncate">{session.title}</span>
              </button>
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Hapus riwayat"
              >
                <Trash2 size={14} />
              </motion.button>
            </motion.div>
          ))}
          {sessions.length === 0 && (
            <p className="text-[11px] text-gray-600 text-center py-6">
              Belum ada riwayat chat
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 p-3">
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
