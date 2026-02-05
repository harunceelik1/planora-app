import { User } from "@/types/user";

export type Project = {
  id: string;
  projectName: string;
  projectKey: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
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
  // 👆 BURAYA KADAR

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
}
export interface ProjectMember {
  user: User;
  role: string;
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
