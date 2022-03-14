import { signOut } from "firebase/auth";
import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentUserInitializedState,
  currentUserState,
} from "@/atoms/userAtoms";
import { auth } from "@/lib/firebase";
import { useToast } from "./useToast";

export const useCurrentUser = () => {
  const { showToast } = useToast();

  const initialized = useRecoilValue(currentUserInitializedState);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const logout = useCallback(async () => {
    await signOut(auth).then(() => {
      showToast("ログアウトしました。", "success");
      setCurrentUser(null);
    });
  }, [setCurrentUser, showToast]);

  return {
    initialized,
    currentUser,
    logout,
  };
};
