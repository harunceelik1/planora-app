export const ROUTES = {
  HOME: "/",
  MAIN: "/main",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROJECTS: {
    LIST: "/main/projects",
    DETAILS: (projectId: string) => `/main/projects/${projectId}`,
  },
  NEW_VERIFICATION: (email: string) =>
    `/new-verification?email=${encodeURIComponent(email)}`,
  CREATE_PROJECT: "/main/create-project",
  PROFILE: "/main/profile",
};
