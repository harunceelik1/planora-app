import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routest";
import { toast } from "react-toastify";

export const useCreateProject = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const createProject = async (data: { name: string; projectKey: string }) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bir hata oluştu.");
      }
      
      router.push(ROUTES.PROJECTS.LIST);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error || "Proje oluşturulamadı.");
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hook, fonksiyonu ve state'leri dışarıya verir
  return { createProject, isLoading, apiError };
};