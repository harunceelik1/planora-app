import { User } from "@/types/user";

export type Project = {
  id: string;
  projectName: string;
  projectKey: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  image: string;
  owner: {
    name: string;
    email?: string;
    image?: string;
  };
  members: {
    id: string;
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }[];
  _count: {
    issues: number;
    members: number;
  };
  isFavorite: boolean;

  sprints: Sprint[];
  issues: Issue[]; // Backlog'daki görevler
};
export interface Sprint {
  id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  issues: Issue[]; // Sprintin içindeki görevler
}
export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  order: number;
  number: number; // Proje içi sıra no (PLAN-12 gibi)
  assigneeId?: string | null; // Veritabanı ID'si (Update yaparken lazım olur)
  assignee?: User | null; // Ekranda göstermek için User objesi
  sprintId?: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;

  dueDate?: string | Date | null;

  // 2. Story Points (UI'da "Estimate" yazdığımız yer için)
  storyPoints?: number | null;

  // 3. Yorumlar (Veritabanından task ile birlikte `include: { comments: true }` çekersen diye)
  comments?: Comment[];

  // 4. (Opsiyonel) UI'da yer ayırdığımız diğer alanlar için hazırlık
  parentId?: string | null; // Eğer bu bir subtask ise, üst task'ın ID'si
  subtasks?: Issue[]; // Eğer bunun alt görevleri varsa
  // attachments?: Attachment[]; // Dosya ekleri için
}
export interface ProjectMember {
  user: User;
  role: string;
}
export interface Comment {
  id: string;
  text: string;
  issueId: string;
  userId: string;
  user?: User; // Yorumu yapan kullanıcının bilgileri (Avatar, isim vs. için)
  createdAt: string;
  updatedAt?: string;
}
export interface ProjectData {
  ownerId: string;
  members: ProjectMember[];
}

export interface UserWithRole extends User {
  role: string;
}
export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
