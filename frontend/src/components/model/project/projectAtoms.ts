import { atom } from "recoil";
import { Project } from "@/models/project";

export const projectsInitializedState = atom<boolean>({
  key: "projectsInitializedState",
  default: false,
});

export const projectsState = atom<Project[]>({
  key: "projectsState",
  default: [],
});
