import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import type { Message } from "@/types";
import { User, Scale, Copy, Check, Download, FileText, FileDown } from "lucide-react";
import { chatApi } from "@/services/api";
import SummaryResponse from "./SummaryResponse";

interface MessageBubbleProps {
  message: Message;
  index?: number;
}

export default function MessageBubble({ message, index = 0 }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format: "docx" | "pdf") => {
    setExporting(true);
    try {
      await chatApi.exportMessage(message.id, format);
    } catch {
      // Silently fail
    } finally {
      setExporting(false);
      setShowExport(false);
    }
  };

  // Tutup dropdown export kalau klik di luar
  useEffect(() => {
    if (!showExport) return;
    const close = () => setShowExport(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showExport]);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`flex gap-3 py-3 group/msg ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar bot */}
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
          className="shrink-0 mt-1"
        >
          <div className="relative">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-1.5 rounded-xl bg-blue-400/20 blur-md"
            />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <Scale size={16} className="text-white" />
            </div>
          </div>
        </motion.div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%] min-w-0`}>
        {/* Label nama */}
        <motion.span
          initial={{ opacity: 0, x: isUser ? 10 : -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={`text-[10px] font-semibold mb-1 px-1 ${isUser ? "text-blue-400" : "text-indigo-400"}`}
        >
          {isUser ? "Anda" : "Legal Chatbot"}
        </motion.span>

        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`relative rounded-2xl px-4 py-3 overflow-hidden break-words ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-md shadow-lg shadow-blue-500/20"
              : "bg-white/95 backdrop-blur-sm border border-gray-200/70 text-gray-900 rounded-tl-md shadow-md shadow-gray-200/50"
          }`}
        >
          {/* Accent bar di sisi bubble bot */}
          {!isUser && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
              style={{ originY: 0 }}
              className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-500"
            />
          )}

          <div className={!isUser ? "pl-2" : ""}>
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <SummaryResponse
                content={message.content}
                table={message.table}
                sources={message.sources}
              />
            )}
          </div>

        </motion.div>

        {/* Action toolbar — di bawah bubble, muncul saat hover */}
        {!isUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200"
          >
            {/* Copy */}
            <motion.button
              type="button"
              onClick={handleCopy}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Salin jawaban"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </motion.button>

            {/* Divider */}
            <div className="w-px h-3.5 bg-gray-200" />

            {/* Export dropdown */}
            <div className="relative">
              <motion.button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowExport(!showExport); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Export jawaban"
                disabled={exporting}
              >
                {exporting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Download size={12} />
                  </motion.div>
                ) : (
                  <Download size={12} />
                )}
                <span>Export</span>
              </motion.button>

              <AnimatePresence>
                {showExport && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    className="absolute bottom-full left-0 mb-1.5 bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden z-20"
                  >
                    <button
                      type="button"
                      onClick={() => handleExport("docx")}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 w-full whitespace-nowrap"
                    >
                      <FileText size={14} className="text-blue-500" />
                      Export DOCX
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport("pdf")}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-red-50 hover:text-red-700 w-full whitespace-nowrap"
                    >
                      <FileDown size={14} className="text-red-500" />
                      Export PDF
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {time && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-[10px] mt-1.5 px-1 text-gray-400"
          >
            {time}
          </motion.span>
        )}
      </div>

      {/* Avatar user */}
      {isUser && (
        <motion.div
          initial={{ scale: 0, rotate: 20 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
          className="shrink-0 mt-1"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gray-400/10 blur-md" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md shadow-gray-500/15">
              <User size={16} className="text-white" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
