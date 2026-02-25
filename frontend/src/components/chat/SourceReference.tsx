import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown } from "lucide-react";
import type { SourceReference as SourceRef } from "@/types";

interface SourceReferenceProps {
  sources: SourceRef[];
}

export default function SourceReference({ sources }: SourceReferenceProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors w-full"
      >
        <FileText size={12} />
        <span>Sumber Referensi ({sources.length})</span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 mt-2">
              {sources.map((source, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2
                             hover:bg-gray-100 transition-colors"
                >
                  <FileText size={11} className="mt-0.5 flex-shrink-0 text-blue-400" />
                  <div>
                    <span className="font-medium text-gray-700">{source.document_name}</span>
                    {source.page && <span className="ml-1 text-gray-400">(hal. {source.page})</span>}
                    <p className="mt-0.5 text-gray-400 line-clamp-2 leading-relaxed">{source.chunk_text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
