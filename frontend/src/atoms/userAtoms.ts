import { atom } from "recoil";
import { User } from "@/models/user";

export const authenticatedUserState = atom<User | null>({
  key: "authenticatedUserState",
  default: null,
});
