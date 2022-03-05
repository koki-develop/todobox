export type Task = {
  projectId: string;
  sectionId: string | null;

  id: string;
  index: number;
  title: string;

  completedAt: Date | null;
};
