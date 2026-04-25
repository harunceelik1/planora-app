export type Subtask = {
  title: string;
  area: "Frontend" | "Backend" | "Database" | "DevOps" | "Testing" | "Design";
  description: string;
  storyPoints: number;
};

export type ApiResponse<T> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type CreateIssueInput = {
  title: string;
  projectId: string;
  sprintId?: string | null;
  description?: string | null;
  storyPoints?: number | null;
};

export type UpdateProfileInput = {
  name?: string | null;
  location?: string | null;
  jobTitle?: string | null;
  timezone?: string | null;
  birthdate?: string | null;
  phone?: string | null;
  image?: string | null;
};
