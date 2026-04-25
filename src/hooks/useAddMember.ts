import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routest";
import { toast } from "react-toastify";
import { set } from "react-hook-form";

export const useAddMember = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const addMember = async (data: { projectId: string; userIds: string[] }) => {
    setIsLoading(true);
    setApiError("");
    try {
      const response = await fetch("/api/project-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("API Response:", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bir hata oluştu.");
      }

      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error || "Üye eklenemedi.");
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return { addMember, isLoading, apiError };
};
