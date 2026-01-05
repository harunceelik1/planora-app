"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function updateProfile(values: any) {
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
  } catch (error) {
    return { error: "Güncelleme başarısız oldu." };
  }
}
