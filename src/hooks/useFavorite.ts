// hooks/use-favorite.ts
import useSWR, { useSWRConfig } from "swr";
import { toggleFavoriteProject } from "@/actions/favorite-actions";
import { toast } from "react-toastify";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Favorite = { id?: string; project: { id: string; name?: string } };
type CurrentUser = { favoriteProjects?: Favorite[] } | null;

export const useFavorite = (
  projectId: string,
  initialStats: boolean = false,
) => {
  const { mutate } = useSWRConfig();

  // SWR Ayarları (Cache kontrolü)
  const { data: user } = useSWR("/api/profile", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  // Favori durumunu kontrol et
  const isFavorited =
    ((user as CurrentUser | null)?.favoriteProjects?.some(
      (fav: Favorite) => String(fav.project.id) === String(projectId)
    ) as boolean | undefined) ?? initialStats;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !isFavorited;

    // Optimistic Update Mantığı
    await mutate(
      "/api/profile",
      async (currentUser: any) => {
        if (!currentUser) return currentUser;
        let updatedFavorites = [...(currentUser.favoriteProjects || [])];

        if (newStatus) {
          updatedFavorites.unshift({
            id: "temp-" + Date.now(),
            project: { id: projectId, name: "Yükleniyor..." },
          });
        } else {
          updatedFavorites = updatedFavorites.filter(
            (fav: Favorite) => String(fav.project.id) !== String(projectId)
          );
        }
        return { ...currentUser, favoriteProjects: updatedFavorites };
      },
      false // Revalidate KAPALI
    );

    try {
      await toggleFavoriteProject(projectId);
      await mutate("/api/project?favorite=true");
    } catch (error) {
      console.error(error);
      toast.error("İşlem başarısız");
      mutate("/api/profile"); // Hata varsa geri al
    }
  };

  return { isFavorited, toggleFavorite };
};
