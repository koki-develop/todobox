export type Task = {
  sectionId: string | null;

  id: string;
  index: number;
  title: string;
  description: string;
  completedAt: Date | null;
};

export type CreateTaskInput = Omit<Task, "id" | "completedAt">;

export type UpdateTaskInput = Partial<Omit<Task, "id">>;
