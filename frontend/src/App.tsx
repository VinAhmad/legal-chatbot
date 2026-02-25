import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";
import { useChat } from "./hooks/useChat";
import { useDocuments } from "./hooks/useDocuments";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chat = useChat();
  const docs = useDocuments();

  const sidebarProps = {
    sessions: chat.sessions,
    currentSessionId: chat.sessionId,
    documents: docs.documents,
    isUploading: docs.isUploading,
    onNewChat: chat.newChat,
    onSelectSession: chat.loadSession,
    onDeleteSession: chat.deleteSession,
    onUpload: docs.uploadDocument,
    onDeleteDocument: docs.deleteDocument,
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block">
        <Sidebar {...sidebarProps} />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative h-full w-72 shadow-2xl"
            >
              <Sidebar
                {...sidebarProps}
                onNewChat={() => {
                  chat.newChat();
                  setSidebarOpen(false);
                }}
                onSelectSession={(id) => {
                  chat.loadSession(id);
                  setSidebarOpen(false);
                }}
                onDeleteSession={(id) => {
                  chat.deleteSession(id);
                  setSidebarOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <ChatWindow
          messages={chat.messages}
          isLoading={chat.isLoading}
          onSend={chat.sendMessage}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-white !text-gray-800 !shadow-lg !rounded-xl !text-sm",
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  );
}
