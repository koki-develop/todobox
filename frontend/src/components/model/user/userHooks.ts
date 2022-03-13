import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { currentUserState } from "./userAtoms";

export const useCurrentUser = () => {
  const initialized = useRecoilValue;
  const currentUser = useRecoilValueLoadable(currentUserState);

  return {
    initialized,
    currentUser,
  };
};
