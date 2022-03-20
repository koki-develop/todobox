import GoogleIcon from "@mui/icons-material/Google";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React, { useCallback } from "react";
import Field from "@/components/utils/Field";
import { useCurrentUser } from "@/hooks/userHooks";

const LoginPage: React.VFC = React.memo(() => {
  const { loginWithGoogle, loginAnonymously } = useCurrentUser();

  const handleClickLoginWithGoogle = useCallback(async () => {
    await loginWithGoogle();
  }, [loginWithGoogle]);

  const handleClickLoginAnonymously = useCallback(async () => {
    await loginAnonymously();
  }, [loginAnonymously]);

  return (
    <Container maxWidth="xs" sx={{ pt: 4 }}>
      <Alert severity="warning" sx={{ justifyContent: "center", mb: 4 }}>
        <AlertTitle sx={{ fontWeight: "bold" }}>
          このアプリケーションはサンプルです。
        </AlertTitle>
        保存されたデータは定期的に削除されます。
      </Alert>

      <Paper sx={{ p: 4, pt: 2 }} elevation={4}>
        <Field>
          <Typography sx={{ textAlign: "center" }} variant="h5">
            Todo Box
          </Typography>
        </Field>

        <Field>
          <Button
            fullWidth
            startIcon={<GoogleIcon />}
            variant="contained"
            onClick={handleClickLoginWithGoogle}
          >
            Google でログイン
          </Button>
        </Field>

        <Field>
          <Button
            fullWidth
            variant="contained"
            onClick={handleClickLoginAnonymously}
          >
            ゲストログイン
          </Button>
        </Field>
      </Paper>
    </Container>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
