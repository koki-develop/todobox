import { atom } from "recoil";
import { User } from "@/models/user";

export const currentUserInitializedState = atom<boolean>({
  key: "currentUserInitializedState",
  default: false,
});

export const currentUserState = atom<User | null>({
  key: "currentUserState",
  default: null,
});
