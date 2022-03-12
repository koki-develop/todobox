import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { auth } from "@/lib/firebase";
import { currentUserInitializedState, currentUserState } from "./userAtoms";

export type CurrentUserListenerProps = {
  //
};

const CurrentUserListener: React.VFC<CurrentUserListenerProps> = React.memo(
  () => {
    const setInitialized = useSetRecoilState(currentUserInitializedState);
    const setCurrentUser = useSetRecoilState(currentUserState);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setInitialized(true);
      });
      return () => {
        unsubscribe();
        setInitialized(false);
        setCurrentUser(null);
      };
    }, [setCurrentUser, setInitialized]);

    return null;
  }
);

CurrentUserListener.displayName = "CurrentUserListener";

export default CurrentUserListener;
