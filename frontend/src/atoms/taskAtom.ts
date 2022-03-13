import { atom } from "recoil";
import { Task } from "@/models/task";

export const incompletedTasksInitializedState = atom<boolean>({
  key: "incompletedTasksInitializedState",
  default: false,
});

export const completedTasksInitializedState = atom<boolean>({
  key: "completedTasksInitializedState",
  default: false,
});

export const tasksState = atom<{ incompleted: Task[]; completed: Task[] }>({
  key: "tasksState",
  default: {
    incompleted: [],
    completed: [],
  },
});
