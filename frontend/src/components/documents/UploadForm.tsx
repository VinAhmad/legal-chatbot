import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

interface UploadFormProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
};

export default function UploadForm({ onUpload, isUploading }: UploadFormProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => onUpload(file));
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024,
    disabled: isUploading,
  });

  return (
    <motion.div
      whileHover={!isUploading ? { scale: 1.02 } : undefined}
      whileTap={!isUploading ? { scale: 0.98 } : undefined}
      className="block"
    >
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-400 bg-blue-950/20" : "border-gray-600 hover:border-blue-400 hover:bg-gray-800/50"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FileText size={22} className="text-blue-400" />
            </motion.div>
            <p className="text-xs text-gray-400">Memproses dokumen...</p>
          </motion.div>
        ) : isDragActive ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <CheckCircle2 size={22} className="text-blue-400" />
            <p className="text-xs text-blue-300 font-medium">Drop file di sini!</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col items-center gap-1.5"
          >
            <Upload size={20} className="text-gray-500" />
            <p className="text-xs text-gray-300 font-medium">
              Drag & drop atau klik
            </p>
            <p className="text-[10px] text-gray-500">PDF, DOCX, CSV, TXT (maks 50MB)</p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}
