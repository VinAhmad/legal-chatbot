import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import {
  Scale, FileSearch, MessageSquareText, BookOpenCheck,
  Sparkles, Shield, FileCheck, Gavel, ArrowDown,
} from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string, files?: File[]) => void;
}

const FEATURES = [
  { icon: FileSearch, label: "Analisis Kontrak", desc: "Upload dan analisis isi kontrak kerja, NDA, dan dokumen legal lainnya", color: "from-blue-500 to-cyan-500" },
  { icon: MessageSquareText, label: "Tanya Jawab Hukum", desc: "Ajukan pertanyaan seputar hukum dan peraturan legal Indonesia", color: "from-violet-500 to-purple-500" },
  { icon: BookOpenCheck, label: "Ringkasan Dokumen", desc: "Dapatkan ringkasan poin-poin penting dari dokumen panjang", color: "from-amber-500 to-orange-500" },
];

const STATS = [
  { icon: Shield, label: "On-Premise", desc: "Data aman di server Anda" },
  { icon: FileCheck, label: "Multi-Format", desc: "PDF, DOCX, CSV, TXT" },
  { icon: Gavel, label: "Hukum Indonesia", desc: "Konteks legal lokal" },
];

function FloatingBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 40, -30, 0], y: [0, -35, 20, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-10 w-[30rem] h-[30rem] rounded-full bg-blue-400/30 blur-[80px]"
      />
      <motion.div
        animate={{ x: [0, -30, 25, 0], y: [0, 25, -20, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 w-[26rem] h-[26rem] rounded-full bg-indigo-400/20 blur-[80px]"
      />
      <motion.div
        animate={{ x: [0, 20, -15, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-purple-400/20 blur-[80px]"
      />
      <motion.div
        animate={{ x: [0, -15, 20, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-cyan-400/15 blur-[60px]"
      />
      <motion.div
        animate={{ x: [0, 10, -10, 0], y: [0, -10, 10, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-1/2 w-56 h-56 rounded-full bg-amber-300/15 blur-[60px]"
      />
      <motion.div
        animate={{ x: [0, 15, -20, 0], y: [0, -15, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-10 w-64 h-64 rounded-full bg-teal-300/15 blur-[60px]"
      />
    </div>
  );
}

function ChatBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/70 to-purple-50/50" />
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-50/40 via-transparent to-amber-50/20" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(to right, #818cf8 1px, transparent 1px), linear-gradient(to bottom, #818cf8 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-gradient-to-bl from-blue-200/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-200/40 to-transparent" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-100/30 to-transparent" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-cyan-100/25 to-transparent" />
      <FloatingBlobs />
    </>
  );
}

export default function ChatWindow({ messages, isLoading, onSend }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollProgress = useMotionValue(0);
  const progressWidth = useTransform(scrollProgress, [0, 1], ["0%", "100%"]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      scrollProgress.set(scrollTop / maxScroll);
    }
    setShowScrollBtn(maxScroll - scrollTop > 150);
  }, [scrollProgress]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <ChatBackground />

      {/* Scroll progress bar */}
      {messages.length > 0 && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] z-30 bg-gray-200/30"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-r-full"
            style={{ width: progressWidth }}
          />
        </motion.div>
      )}

      {/* Scroll area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 relative z-10 scroll-smooth"
      >
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center h-full"
            >
              {/* Logo hero */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative mb-6"
              >
                <div className="absolute -inset-6 rounded-full bg-blue-400/15 blur-2xl" />
                <div className="absolute -inset-14 rounded-full bg-indigo-300/8 blur-3xl" />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/25 ring-4 ring-white/50"
                >
                  <Scale size={36} className="text-white" />
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1.5 -right-1.5"
                  >
                    <Sparkles size={16} className="text-amber-400 drop-shadow-sm" />
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-extrabold bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-700 bg-clip-text text-transparent"
              >
                Legal Chatbot
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-3 text-sm text-center max-w-lg text-gray-500 leading-relaxed"
              >
                Asisten AI untuk membantu analisis dokumen legal Anda. Upload dokumen
                atau lampirkan file langsung di chat untuk memulai.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-6 flex items-center gap-6"
              >
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs text-gray-400">
                    <s.icon size={14} className="text-blue-400" />
                    <div>
                      <span className="font-semibold text-gray-600">{s.label}</span>
                      <span className="mx-1 text-gray-300">-</span>
                      <span>{s.desc}</span>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Feature cards */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
                {FEATURES.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.45 }}
                    whileHover={{ y: -3 }}
                    className="group relative flex flex-col items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200/60 px-5 py-6 shadow-sm hover:shadow-md hover:border-blue-200/80 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/40 group-hover:to-indigo-50/20 transition-all duration-300" />
                    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                      <s.icon size={22} className="text-white" />
                    </div>
                    <div className="relative text-center">
                      <span className="text-sm font-bold text-gray-800 leading-tight block">{s.label}</span>
                      <span className="text-xs text-gray-400 mt-1.5 block leading-relaxed">{s.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="mt-8 flex flex-col items-center gap-2"
              >
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-400" />
                  Didukung AI untuk membantu analisis dokumen legal Anda
                </p>
                <p className="text-[10px] text-gray-300">
                  Ketik pertanyaan di bawah atau lampirkan file untuk memulai
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-1"
            >
              {/* Start-of-chat divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 py-4"
              >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  <Scale size={12} className="text-blue-500" />
                  <span className="text-[10px] font-medium text-gray-400">Awal percakapan</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent" />
              </motion.div>

              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <MessageBubble key={msg.id} message={msg} index={idx} />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-3 items-end py-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full"
                      />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: `linear-gradient(135deg, #3b82f6, #6366f1)` }}
                              animate={{
                                y: [0, -10, 0],
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </div>
                        <motion.span
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-xs text-gray-400"
                        >
                          Sedang menganalisis...
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && messages.length > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
          >
            <ArrowDown size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="relative z-10">
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
