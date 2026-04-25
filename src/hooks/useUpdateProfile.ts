"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { revalidatePath } from "next/cache";
import type { UpdateProfileInput } from "@/types/shared";

export async function updateProfile(values: UpdateProfileInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Yetkisiz erişim" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...values,
        birthdate: values.birthdate ? new Date(values.birthdate) : null,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error || "Güncelleme başarısız oldu.");
    console.error("updateProfile error:", message);
    return { error: message };
  }
}
