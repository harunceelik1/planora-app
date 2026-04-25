import { z } from "zod";

export const decomposeBodySchema = z.object({
  title: z.string().min(1),
  projectId: z.string().min(1),
  sprintId: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  projectKey: z.string().min(1),
});

export const updateIssueStatusSchema = z.object({
  issueId: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]),
});

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const projectMembersAddSchema = z.object({
  projectId: z.string().min(1),
  userIds: z.array(z.string().min(1)).min(1),
});

export const projectMemberPatchSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional(),
});

export const projectMemberDeleteSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1),
});

export const notificationsReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
});

export const newVerificationSchema = z.object({ token: z.string().min(1) });
export const resendSchema = z.object({ email: z.string().email() });

export const bulkDeleteSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

export function parseSafe<T extends z.ZodTypeAny>(schema: T, data: unknown): { ok: true; data: z.infer<T> } | { ok: false; error: any } {
  const res = schema.safeParse(data);
  if (!res.success) return { ok: false, error: res.error.format() };
  return { ok: true, data: res.data } as { ok: true; data: z.infer<T> };
}

export default { decomposeBodySchema, createProjectSchema, updateIssueStatusSchema, parseSafe };
