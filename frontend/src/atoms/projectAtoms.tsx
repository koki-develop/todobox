import { atom } from "recoil";
import { Project } from "@/models/project";

export const projectsState = atom<Project[]>({
  key: "projectsState",
  default: [],
});
