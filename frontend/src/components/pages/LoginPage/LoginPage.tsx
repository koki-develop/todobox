import GoogleIcon from "@mui/icons-material/Google";
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
    <Container maxWidth="sm" sx={{ mt: 20 }}>
      <Paper sx={{ p: 4 }} elevation={10}>
        <Field>
          <Typography sx={{ textAlign: "center" }} variant="h5">
            TODO BOX
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
