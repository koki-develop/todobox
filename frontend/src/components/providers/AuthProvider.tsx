import { onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

export type AuthContext = {
  initialized: boolean;
  currentUser: User | null;
};

const authContext = createContext<AuthContext>({
  initialized: false,
  currentUser: null,
});

export type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider: React.VFC<AuthProviderProps> = React.memo((props) => {
  const { children } = props;

  const [initialized, setInitialized] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setInitialized(true);
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <authContext.Provider value={{ currentUser, initialized }}>
      {children}
    </authContext.Provider>
  );
});

AuthProvider.displayName = "AuthProvider";

export default AuthProvider;

export const useAuth = (): AuthContext => useContext(authContext);
