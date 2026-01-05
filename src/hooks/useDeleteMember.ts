import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify"; // veya "sonner" kullanıyorsan onu import et

export const useDeleteMember = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const deleteMember = async (projectId: string, userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/project-members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Üye silinemedi.");
      }

      toast.success("Üye projeden çıkarıldı.");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteMember, isLoading };
};
