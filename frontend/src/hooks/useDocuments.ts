import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "@/services/api";
import toast from "react-hot-toast";

export function useDocuments() {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: documentApi.list,
    refetchInterval: (query) => {
      const docs = query.state.data ?? [];
      const hasProcessing = docs.some((d) => d.status === "processing");
      return hasProcessing ? 3000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: documentApi.upload,
    onSuccess: (data) => {
      const msg =
        data.status === "processing"
          ? `${data.filename} berhasil di-upload. Sedang diproses...`
          : `${data.filename} berhasil di-upload (${data.chunk_count} chunks)`;
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => {
      toast.error("Gagal upload dokumen");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentApi.delete,
    onSuccess: () => {
      toast.success("Dokumen berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => {
      toast.error("Gagal menghapus dokumen");
    },
  });

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    isUploading: uploadMutation.isPending,
    uploadDocument: uploadMutation.mutate,
    deleteDocument: deleteMutation.mutate,
  };
}
