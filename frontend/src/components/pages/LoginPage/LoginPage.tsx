import GoogleIcon from "@mui/icons-material/Google";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import React, { useCallback } from "react";
import Field from "@/components/utils/Field";
import { useCurrentUser } from "@/hooks/userHooks";

const LoginPage: React.VFC = React.memo(() => {
  const { loginWithGoogle, loginAnonymously } = useCurrentUser();

  const theme = useTheme();

  const handleClickLoginWithGoogle = useCallback(async () => {
    await loginWithGoogle();
  }, [loginWithGoogle]);

  const handleClickLoginAnonymously = useCallback(async () => {
    await loginAnonymously();
  }, [loginAnonymously]);

  return (
    <Container maxWidth="xs" sx={{ pt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Alert severity="warning" sx={{ justifyContent: "center" }}>
          <AlertTitle sx={{ fontWeight: "bold" }}>
            このアプリケーションはサンプルです。
          </AlertTitle>
          保存されたデータは定期的に削除されます。
        </Alert>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 4, pt: 2 }} elevation={4}>
          <Field>
            <Typography
              sx={{
                fontFamily: "Anton",
                textAlign: "center",
              }}
              variant="h4"
            >
              Todo Box
            </Typography>
          </Field>

          <Field>
            <Button
              fullWidth
              color="google"
              startIcon={<GoogleIcon />}
              variant="contained"
              onClick={handleClickLoginWithGoogle}
            >
              Google アカウントでログイン
            </Button>
          </Field>

          <Field>
            <Button
              fullWidth
              color="black"
              variant="contained"
              onClick={handleClickLoginAnonymously}
            >
              ゲストログイン
            </Button>
          </Field>
        </Paper>
      </Box>

      <Box
        component="footer"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Field sx={{ textAlign: "center" }}>
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="https://koki.me"
            sx={{ color: theme.palette.text.primary }}
          >
            &copy;2022 koki
          </Link>
        </Field>
        <Field sx={{ textAlign: "center" }}>
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="https://github.com/koki-develop/todo-box"
            sx={{ color: theme.palette.text.primary }}
          >
            View on GitHub
          </Link>
        </Field>
      </Box>
    </Container>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
