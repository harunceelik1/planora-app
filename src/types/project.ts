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
  _count: {
    issues: number;
    members: number;
  };
  isFavorite: boolean;
};

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