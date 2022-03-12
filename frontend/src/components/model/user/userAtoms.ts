import { User } from "firebase/auth";
import { atom } from "recoil";

export const currentUserInitializedState = atom<boolean>({
  key: "currentUserInitializedState",
  default: false,
});

export const currentUserState = atom<User | null>({
  key: "currentUserState",
  default: null,
});
