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

  const completedCount = issues.filter((task) => task.status === "DONE").length;
  return Math.round((completedCount / issues.length) * 100);
}
