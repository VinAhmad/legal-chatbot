import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chatApi } from "@/services/api";
import type { Message, ChatSession } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: chatApi.getSessions,
    retry: 1,
  });

  const sendMutation = useMutation({
    mutationFn: chatApi.send,
    onSuccess: (response) => {
      if (response.session_id) {
        setSessionId(response.session_id);
      }
      const assistantMessage: Message = {
        id: response.message_id,
        role: "assistant",
        content: response.summary,
        table: response.table ?? null,
        sources: response.sources ?? [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengirim pesan. Coba lagi.");
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      sendMutation.mutate({ message: content, session_id: sessionId ?? undefined });
    },
    [sessionId, sendMutation]
  );

  const loadSession = useCallback(async (id: string) => {
    setSessionId(id);
    try {
      const history = await chatApi.getHistory(id);
      const mapped: Message[] = (history as Record<string, unknown>[]).map((m) => ({
        id: String(m.id),
        role: String(m.role) as "user" | "assistant",
        content: String(m.content),
        table: (m.table as Message["table"]) ?? null,
        sources: Array.isArray(m.sources) ? m.sources : [],
        timestamp: String(m.timestamp),
      }));
      setMessages(mapped);
    } catch {
      toast.error("Gagal memuat riwayat chat");
      setMessages([]);
    }
  }, []);

  const newChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
  }, []);

  const deleteSessionMutation = useMutation({
    mutationFn: chatApi.deleteSession,
    onError: () => {
      toast.error("Gagal menghapus riwayat chat");
    },
  });

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        await deleteSessionMutation.mutateAsync(id);
        // Update cache: buang session yang dihapus
        queryClient.setQueryData<ChatSession[]>(["chat-sessions"], (old) =>
          old ? old.filter((s) => s.id !== id) : []
        );
        // Refetch dari server biar list pasti up to date
        await queryClient.refetchQueries({ queryKey: ["chat-sessions"] });
        if (sessionId === id) {
          setSessionId(null);
          setMessages([]);
        }
        toast.success("Riwayat chat dihapus");
      } catch {
        // onError mutation sudah handle toast
      }
    },
    [deleteSessionMutation, queryClient, sessionId]
  );

  return {
    messages,
    sessionId,
    sessions: sessionsQuery.data ?? [],
    isLoading: sendMutation.isPending,
    sendMessage,
    loadSession,
    newChat,
    deleteSession,
  };
}
