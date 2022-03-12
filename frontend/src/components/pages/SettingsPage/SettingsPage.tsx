import { User } from "firebase/auth";
import React from "react";

export type SettingsPageProps = {
  currentUser: User;
};

const SettingsPage: React.VFC<SettingsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  return <div>settings: {currentUser.uid}</div>;
});

SettingsPage.displayName = "SettingsPage";

export default SettingsPage;
