const API = {
  PORJECT: {
    LIST: "/projects", // GET
    CREATE: "/projects", // POST
    UPDATE: (projectId: string) => `/projects/${projectId}`, // PUT
    DELETE: (projectId: string) => `/projects/${projectId}`, // DELETE
    DETAILS: (projectId: string) => `/projects/${projectId}`, // GET
  },
  USER_MANAGEMENT: {
    ADD_USER: "/user/profile",
    REMOVE_USER: (userId: string) => `/user/${userId}`,
    UPDATE_ROLE: (userId: string) => `/user/${userId}/role`,
  }
};