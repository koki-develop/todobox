import { atom } from "recoil";
import { Section } from "@/models/section";

export const sectionsInitializedState = atom<boolean>({
  key: "sectionsInitializedState",
  default: false,
});

export const sectionsState = atom<Section[]>({
  key: "sectionsState",
  default: [],
});
