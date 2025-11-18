export const ROUTES = {
  HOME: "/",
  MAIN: "/main",
  PROJECTS: {
    LIST: "/main/projects",
    DETAILS: (projectId: string) => `/main/projects/${projectId}`,
  },
  CREATE_PROJECT: "/main/create-project",
  PROFILE: "/main/profile",
}