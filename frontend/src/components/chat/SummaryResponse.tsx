import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ResponseTable from "./ResponseTable";
import SourceReference from "./SourceReference";
import type { TableData, SourceReference as SourceRef } from "@/types";

interface SummaryResponseProps {
  content: string;
  table?: TableData | null;
  sources?: SourceRef[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function SummaryResponse({ content, table, sources }: SummaryResponseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-3"
    >
      <motion.div
        variants={childVariants}
        className="prose prose-sm max-w-none
                   prose-headings:text-gray-800 prose-headings:font-bold
                   prose-p:text-gray-600 prose-p:leading-relaxed
                   prose-strong:text-gray-800
                   prose-li:text-gray-600
                   prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </motion.div>

      {table && table.columns.length > 0 && (
        <motion.div variants={childVariants}>
          <ResponseTable table={table} />
        </motion.div>
      )}

      {sources && sources.length > 0 && (
        <motion.div variants={childVariants}>
          <SourceReference sources={sources} />
        </motion.div>
      )}
    </motion.div>
  );
}
