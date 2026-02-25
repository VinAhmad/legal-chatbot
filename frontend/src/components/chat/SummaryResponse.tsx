import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ResponseTable from "./ResponseTable";
import SourceReference from "./SourceReference";
import type { TableData, SourceReference as SourceRef } from "@/types";

interface SummaryResponseProps {
  content: string;
  table?: TableData | null;
  sources?: SourceRef[];
}

export default function SummaryResponse({ content, table, sources }: SummaryResponseProps) {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-700"
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </motion.div>

      {table && table.columns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ResponseTable table={table} />
        </motion.div>
      )}

      {sources && sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <SourceReference sources={sources} />
        </motion.div>
      )}
    </div>
  );
}
