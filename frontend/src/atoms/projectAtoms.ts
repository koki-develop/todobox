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

export const projectInitializedState = atom<boolean>({
  key: "projectInitializedState",
  default: false,
});

export const projectState = atom<Project | null>({
  key: "projectState",
  default: null,
});
