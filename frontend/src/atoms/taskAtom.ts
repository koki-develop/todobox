import { atom } from "recoil";
import { Task } from "@/models/task";

export const incompletedTasksInitializedState = atom<boolean>({
  key: "incompletedTasksInitializedState",
  default: false,
});

export const incompletedTasksState = atom<Task[]>({
  key: "incompletedTasksState",
  default: [],
});

export const completedTasksInitializedState = atom<boolean>({
  key: "completedTasksInitializedState",
  default: false,
});

export const completedTasksState = atom<Task[]>({
  key: "completedTasksState",
  default: [],
});

export const tasksState = atom<{ incompleted: Task[]; completed: Task[] }>({
  key: "tasksState",
  default: {
    incompleted: [],
    completed: [],
  },
});
