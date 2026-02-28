import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, BookOpen } from "lucide-react";
import type { SourceReference as SourceRef } from "@/types";

interface SourceReferenceProps {
  sources: SourceRef[];
}

export default function SourceReference({ sources }: SourceReferenceProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors w-full group"
      >
        <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <BookOpen size={11} className="text-blue-500" />
        </div>
        <span>Sumber Referensi ({sources.length})</span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronDown size={14} />
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
            <div className="space-y-2 mt-2.5">
              {sources.map((source, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-2.5 text-xs bg-gradient-to-r from-blue-50/60 to-indigo-50/40 rounded-lg px-3 py-2.5
                             border border-blue-100/60 hover:border-blue-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={12} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{source.document_name}</span>
                      {source.page && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                          Hal. {source.page}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-gray-500 line-clamp-2 leading-relaxed">{source.chunk_text}</p>
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
