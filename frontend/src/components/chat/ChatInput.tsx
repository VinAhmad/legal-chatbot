import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Paperclip, X, FileText } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

const MAX_CHARS = 2000;

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && attachedFiles.length === 0) || isLoading) return;
    if (trimmed.length > MAX_CHARS) return;
    onSend(trimmed || "Berikan ringkasan dari dokumen yang dilampirkan.", attachedFiles.length ? attachedFiles : undefined);
    setInput("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = (input.trim().length > 0 || attachedFiles.length > 0) && !isLoading && input.length <= MAX_CHARS;

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number | undefined) => {
    if (bytes == null || bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExt = (name: string) => name.split(".").pop()?.toUpperCase() || "FILE";

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files;
    if (chosen?.length) {
      setAttachedFiles((prev) => [...prev, ...Array.from(chosen)]);
      e.target.value = "";
    }
  };

  const charRatio = input.length / MAX_CHARS;
  const charColor = charRatio > 0.9 ? "text-red-500" : charRatio > 0.7 ? "text-amber-500" : "text-gray-400";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="border-t border-gray-200/50 bg-white/70 backdrop-blur-lg p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.csv,.xlsx,.xls,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv"
        className="hidden"
        onChange={onFileChange}
      />
      {/* Bar lampiran */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-4xl mx-auto mb-3">
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                <Paperclip size={12} />
                {attachedFiles.length} file sebagai referensi
              </p>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((f, i) => (
                  <motion.span
                    key={`${f.name}-${i}`}
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-3 py-2 text-sm shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-gray-800 text-xs block max-w-[160px] truncate" title={f.name}>
                        {f.name}
                      </span>
                      <span className="text-[10px] text-gray-400">{getFileExt(f.name)} &middot; {formatSize(f.size)}</span>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => removeFile(i)}
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.8 }}
                      className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Hapus lampiran"
                    >
                      <X size={14} />
                    </motion.button>
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-stretch gap-3 max-w-4xl mx-auto min-h-[52px]">
        {/* Tombol attach */}
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          whileHover={{ scale: 1.08, rotate: 15 }}
          whileTap={{ scale: 0.92, rotate: -5 }}
          className={`shrink-0 flex items-center justify-center rounded-xl border w-12 transition-all duration-200
                     ${attachedFiles.length > 0
                       ? "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 text-blue-600 shadow-sm"
                       : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700"}
                     disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Lampirkan file (referensi untuk pertanyaan ini)"
        >
          <Paperclip size={18} />
        </motion.button>

        {/* Input box */}
        <div className="flex-1 relative">
          <div
            className={`rounded-xl border bg-white/80 min-h-[52px] flex flex-col justify-center
                        transition-all duration-300
                        ${isFocused ? "ring-2 ring-blue-500/30 border-blue-400 bg-white shadow-md shadow-blue-100/50" : "border-gray-200"}
                        ${attachedFiles.length > 0 && !isFocused ? "border-blue-200" : ""}`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS + 100))}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={attachedFiles.length ? "Tambah pertanyaan (opsional) atau kirim untuk ringkasan lampiran..." : "Ketik pertanyaan tentang dokumen legal..."}
              rows={1}
              disabled={isLoading}
              className="w-full resize-none border-0 bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-0
                         disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 min-h-[44px] rounded-xl"
            />
          </div>
          {/* Focus glow */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-1 rounded-2xl bg-blue-400/5 blur-sm -z-10"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tombol kirim */}
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.08 } : {}}
          whileTap={canSend ? { scale: 0.88 } : {}}
          className={`shrink-0 flex items-center justify-center rounded-xl w-12 text-white transition-all duration-300
                     ${canSend
                       ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                       : "bg-gray-300 shadow-none cursor-not-allowed"}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 360, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.15 } }}
              >
                <Loader2 size={18} />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Send size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Footer: hint + char counter */}
      <div className="flex items-center justify-between mt-2.5 max-w-4xl mx-auto px-1">
        <p className="text-[10px] text-gray-400">
          <span className="font-medium text-gray-500">Enter</span> kirim &middot; <span className="font-medium text-gray-500">Shift+Enter</span> baris baru
        </p>
        {input.length > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-[10px] font-medium ${charColor}`}
          >
            {input.length}/{MAX_CHARS}
          </motion.span>
        )}
      </div>
    </motion.form>
  );
}
