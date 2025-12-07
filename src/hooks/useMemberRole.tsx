"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify"; // veya "sonner"

interface ChangeRoleParams {
  projectId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
}

export function useMemberRole() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const changeRole = async ({ projectId, userId, role }: ChangeRoleParams) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/project-members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API'den gelen özel hatayı göster (Örn: "Sadece proje sahibi yetki dağıtabilir")
        throw new Error(data.error || "Rol değiştirilemedi.");
      }

      toast.success(
        role === "ADMIN"
          ? "Kullanıcı yönetici yapıldı."
          : "Kullanıcının yönetici yetkisi alındı."
      );

      router.refresh(); // Listeyi anında yenile
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Bir hata oluştu.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { changeRole, isLoading };
}
