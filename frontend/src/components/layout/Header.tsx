import { motion } from "framer-motion";
import { Menu, Scale } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden"
    >
      <motion.button
        onClick={onToggleSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} className="text-gray-600" />
      </motion.button>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <Scale size={12} className="text-white" />
        </div>
        <h1 className="font-bold text-gray-800 text-sm">Legal Chatbot</h1>
      </div>
    </motion.header>
  );
}
