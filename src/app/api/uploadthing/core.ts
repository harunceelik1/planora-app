import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// BURASI UPLOADTHING İÇİN GEREKLİ TEMEL AYARLARIN YAPILDIĞI YERDİR. KİMLER DOSYA YÜKLEYEBİLİR VS.

const f = createUploadthing();

const handleAuth = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return { userId: session.user.id };
};

export const ourFileRouter = {
  // "projectImage" adında bir yükleme rotası tanımlıyoruz
  projectImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
