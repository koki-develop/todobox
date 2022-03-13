export type Task = {
  sectionId: string | null;

  id: string;
  index: number;
  title: string;
  completedAt: Date | null;
};

export type CreateTaskInput = Omit<Task, "id" | "completedAt">;
