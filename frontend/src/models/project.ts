export type Project = {
  id: string;
  name: string;
};

export type CreateProjectInput = Omit<Project, "id">;
