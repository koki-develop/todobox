import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentUserInitializedState,
  currentUserState,
} from "@/atoms/userAtoms";
import { auth, functions } from "@/lib/firebase";
import { useToast } from "./useToast";

export const useCurrentUser = () => {
  const { showToast } = useToast();

  const initialized = useRecoilValue(currentUserInitializedState);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const loginWithGoogle = useCallback(async () => {
    await signInWithRedirect(auth, new GoogleAuthProvider());
    showToast("ログインしました。", "success");
  }, [showToast]);

  const loginAnonymously = useCallback(async () => {
    await signInAnonymously(auth);
    showToast("ログインしました。", "success");
  }, [showToast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    showToast("ログアウトしました。", "success");
    setCurrentUser(null);
  }, [setCurrentUser, showToast]);

  const deleteAccount = useCallback(async () => {
    const deleteUser = httpsCallable(functions, "deleteUser");
    await deleteUser();
    await signOut(auth);
    setCurrentUser(null);
    showToast(
      "アカウントを削除しました。またのご利用をお待ちしております。",
      "success"
    );
  }, [setCurrentUser, showToast]);

  return {
    initialized,
    currentUser,
    loginWithGoogle,
    loginAnonymously,
    logout,
    deleteAccount,
  };
};
