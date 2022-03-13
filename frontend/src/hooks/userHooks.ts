import { useRecoilValue } from "recoil";
import {
  currentUserInitializedState,
  currentUserState,
} from "@/atoms/userAtoms";

export const useCurrentUser = () => {
  const initialized = useRecoilValue(currentUserInitializedState);
  const currentUser = useRecoilValue(currentUserState);

  return {
    initialized,
    currentUser,
  };
};