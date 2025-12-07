"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface UpdateProjectValues {
  name?: string;
  key?: string;
  image?: string;
  icon?: string;
  color?: string;
}

// 👇 Yeni seçenekler interface'i
interface UpdateOptions {
  showToast?: boolean; // Varsayılan true olacak
}

export function useUpdateProject(projectId: string) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // 👇 İkinci parametre olarak options ekledik
  const updateProject = async (
    values: UpdateProjectValues,
    options?: UpdateOptions
  ) => {
    // Varsayılan olarak toast göster, ama false geldiyse gösterme
    const showToast = options?.showToast ?? true;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 403) {
          toast.error(
            data.error || "Bu işlemi yapmak için proje sahibi olmalısınız."
          );
          return false;
        }
        throw new Error(data.error || "Güncelleme başarısız.");
      }

      // 👇 SADECE showToast TRUE İSE BİLDİRİM GÖSTER
      if (showToast) {
        toast.success("Proje güncellendi.");
      }

      router.refresh();
      return true;
    } catch (error) {
      console.error(error);
      if (showToast) {
        toast.error("Bir hata oluştu.");
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProject, isUpdating };
}
