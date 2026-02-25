import { motion } from "framer-motion";
import type { TableData } from "@/types";

interface ResponseTableProps {
  table: TableData;
}

export default function ResponseTable({ table }: ResponseTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {table.columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {table.rows.map((row, idx) => (
            <motion.tr
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="hover:bg-blue-50/50 transition-colors"
            >
              {table.columns.map((col) => (
                <td key={col.key} className="px-4 py-2.5 text-gray-600">
                  {row.data[col.key] ?? "-"}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
