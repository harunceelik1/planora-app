"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateIssueAssignee(
  issueId: string,
  assigneeId: string,
  projectId: string,
) {
  try {
    await db.issue.update({
      where: { id: issueId },
      data: {
        assigneeId: assigneeId === "" ? null : assigneeId,
      },
    });

    // 🔥 BALYOZ: "/" diyerek tüm projeyi ve tüm cache'leri sıfırlıyoruz.
    // Bu sayede hangi URL'de olursan ol veri güncellenmek ZORUNDA kalacak.
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    return { error: "Atama yapılamadı." };
  }
}
