import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import UserDeleteConfirmModal from "@/components/model/user/UserDeleteConfirmModal";
import Field from "@/components/utils/Field";

export type SettingsPageProps = {
  currentUser: User;
};

const SettingsPage: React.VFC<SettingsPageProps> = React.memo(() => {
  const theme = useTheme();

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);

  const handleClickDeleteAccount = useCallback(async () => {
    setOpenDeleteConfirm(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setOpenDeleteConfirm(false);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <UserDeleteConfirmModal
        open={openDeleteConfirm}
        onCancel={handleCloseDeleteConfirm}
      />
      <Field>
        <Alert
          icon={false}
          severity="error"
          sx={{ border: "1px solid", borderColor: theme.palette.error.main }}
        >
          <Field>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              アカウントを削除
            </Typography>
            <Typography>
              アカウントとそれに紐づく全てのデータを完全に削除します。この操作は取り消せません。
            </Typography>
          </Field>
          <Field>
            <Button
              color="error"
              variant="contained"
              onClick={handleClickDeleteAccount}
            >
              アカウントを削除
            </Button>
          </Field>
        </Alert>
      </Field>
    </Container>
  );
});

SettingsPage.displayName = "SettingsPage";

export default SettingsPage;
