import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import { useCurrentUser } from "@/hooks/userHooks";

export type SettingsPageProps = {
  currentUser: User;
};

const SettingsPage: React.VFC<SettingsPageProps> = React.memo((props) => {
  const { currentUser } = props;
  const { deleteAccount } = useCurrentUser();

  const [deleting, setDeleting] = useState<boolean>(false);

  const handleClickDeleteAccount = useCallback(async () => {
    setDeleting(true);
    await deleteAccount().finally(() => {
      setDeleting(false);
    });
  }, [deleteAccount]);

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
