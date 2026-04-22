"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth"; // 👈 NextAuth'dan bunu çekiyoruz
import { authOptions } from "@/lib/auth-options";

export const toggleFavoriteProject = async (projectId: string) => {
  // 1. Session'ı direkt burada, manuel olarak alıyoruz
  const session = await getServerSession(authOptions);
  const user = session?.user;
  console.log("USERss", user);

  // 2. Kullanıcı kontrolü (ID var mı?)
  if (!user || !user.id) {
    throw new Error("Bu işlemi yapmak için giriş yapmalısınız.");
  }

  // 3. Veritabanında favori var mı kontrol et
  const existingFavorite = await db.favoriteProject.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: projectId,
      },
    },
  });

  if (existingFavorite) {
    // Varsa sil (Favoriden çıkar)
    await db.favoriteProject.delete({
      where: {
        id: existingFavorite.id,
      },
    });
  } else {
    // Yoksa ekle (Favoriye al)
    await db.favoriteProject.create({
      data: {
        userId: user.id,
        projectId: projectId,
      },
    });
  }

  // 4. İlgili sayfaları yenile ki arayüz güncellensin
  revalidatePath("/main");
  revalidatePath(`/main/projects/${projectId}`);
};
