import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Message } from "@/types";
import { User, Scale, Copy, Check } from "lucide-react";
import { useState } from "react";
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

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}>
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
          className={`relative rounded-2xl px-4 py-3 ${
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

          {/* Tombol copy — muncul saat hover */}
          {!isUser && (
            <motion.button
              type="button"
              onClick={handleCopy}
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-400 hover:text-blue-600 opacity-0 group-hover/msg:opacity-100 transition-opacity"
              title="Salin jawaban"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </motion.button>
          )}
        </motion.div>

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
