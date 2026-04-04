// lib/project-helpers.ts
import { Project } from "@/types/project";

/**
 * Projenin Story Point bazlı ilerleme yüzdesini hesaplar.
 * @param project - İçinde tasks dizisi olan proje objesi
 * @returns 0-100 arası tam sayı
 */
export function calculateProjectProgress(project: Project): number {
  const issues = project.issues || [];

  if (issues.length === 0) return 0;

  // 1. Toplam Story Point (Puan girilmemişse 0 sayar)
  const totalPoints = issues.reduce(
    (acc, task) => acc + (Number(task.storyPoints) || 0),
    0,
  );

  if (totalPoints === 0) {
    // Eğer görevler var ama hiçbirine puan girilmemişse,
    // alternatif olarak görev sayısı oranına dönebilirsin
    // veya direkt 0 döndürebilirsin.
    return 0;
  }

  // 2. Tamamlanan Story Point
  const donePoints = issues
    .filter((task) => task.status === "DONE")
    .reduce((acc, task) => acc + (Number(task.storyPoints) || 0), 0);

  // 3. Yüzdeyi hesapla ve yuvarla
  return Math.round((donePoints / totalPoints) * 100);
}
