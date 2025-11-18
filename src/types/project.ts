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