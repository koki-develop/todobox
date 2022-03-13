import { atom } from "recoil";
import { Section } from "@/models/section";

export const sectionsState = atom<Section[]>({
  key: "sectionsState",
  default: [],
});
