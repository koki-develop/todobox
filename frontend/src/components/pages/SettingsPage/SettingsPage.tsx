import { signOut, User } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import React, { useCallback, useState } from "react";
import { auth, functions } from "@/lib/firebase";

export type SettingsPageProps = {
  currentUser: User;
};

const SettingsPage: React.VFC<SettingsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const [deleting, setDeleting] = useState<boolean>(false);

  const handleClickDeleteAccount = useCallback(() => {
    setDeleting(true);
    const deleteUser = httpsCallable(functions, "deleteUser");
    deleteUser()
      .then(() => {
        signOut(auth);
      })
      .finally(() => {
        setDeleting(false);
      });
  }, []);

  return (
    <div>
      {deleting && "deleting..."}
      {currentUser.uid}
      <button onClick={handleClickDeleteAccount}>delete account</button>
    </div>
  );
});

SettingsPage.displayName = "SettingsPage";

export default SettingsPage;
