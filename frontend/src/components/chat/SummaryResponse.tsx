import { useRef, type ComponentPropsWithoutRef } from "react";
import { motion, useInView } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const markdownComponents = {
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table
        className="min-w-full divide-y divide-gray-200 text-sm"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      className="px-4 py-2.5 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider
                 border-b border-gray-200 whitespace-nowrap"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-4 py-2.5 text-gray-600 border-b border-gray-50"
      {...props}
    >
      {children}
    </td>
  ),
  tr: ({ children, ...props }: ComponentPropsWithoutRef<"tr">) => (
    <tr className="hover:bg-blue-50/40 transition-colors" {...props}>
      {children}
    </tr>
  ),
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
      className="space-y-3 overflow-hidden"
    >
      <motion.div
        variants={childVariants}
        className="prose prose-sm max-w-none break-words overflow-hidden
                   prose-headings:text-gray-800 prose-headings:font-bold
                   prose-p:text-gray-600 prose-p:leading-relaxed
                   prose-strong:text-gray-800
                   prose-li:text-gray-600
                   prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                   prose-pre:overflow-x-auto prose-pre:max-w-full prose-code:break-all
                   prose-table:m-0"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
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
