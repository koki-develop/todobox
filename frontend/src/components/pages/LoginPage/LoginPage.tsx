import GoogleIcon from "@mui/icons-material/Google";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useState, useMemo } from "react";
import Field from "@/components/utils/Field";
import LoadableButton from "@/components/utils/LoadableButton";
import { useCurrentUser } from "@/hooks/userHooks";

const LoginPage: React.VFC = React.memo(() => {
  const [loggingInWithGoogle, setLoggingInWithGoogle] =
    useState<boolean>(false);
  const [loggingInAnonymously, setLoggingInAnonymously] =
    useState<boolean>(false);

  const loggingIn = useMemo(
    () => loggingInWithGoogle || loggingInAnonymously,
    [loggingInAnonymously, loggingInWithGoogle]
  );

  const { loginWithGoogle, loginAnonymously } = useCurrentUser();
  const theme = useTheme();

  const handleClickLoginWithGoogle = useCallback(async () => {
    setLoggingInWithGoogle(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await loginWithGoogle().finally(() => {
      setLoggingInWithGoogle(false);
    });
  }, [loginWithGoogle]);

  const handleClickLoginAnonymously = useCallback(async () => {
    setLoggingInAnonymously(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await loginAnonymously().finally(() => {
      setLoggingInAnonymously(false);
    });
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
                mb: 1,
                textAlign: "center",
              }}
              variant="h4"
            >
              Todo Box
            </Typography>

            <Divider />
          </Field>

          <Field>
            <LoadableButton
              fullWidth
              loading={loggingInWithGoogle}
              disabled={loggingIn}
              color="google"
              startIcon={<GoogleIcon />}
              variant="contained"
              onClick={handleClickLoginWithGoogle}
            >
              Google アカウントでログイン
            </LoadableButton>
          </Field>

          <Field>
            <LoadableButton
              fullWidth
              loading={loggingInAnonymously}
              disabled={loggingIn}
              variant="contained"
              onClick={handleClickLoginAnonymously}
            >
              ゲストログイン
            </LoadableButton>
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
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="https://koki.me"
            sx={{ color: theme.palette.text.primary }}
          >
            &copy;2022 koki
          </Link>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="https://github.com/koki-develop/todobox"
            sx={{ color: theme.palette.text.primary }}
          >
            View on GitHub
          </Link>
        </Box>
      </Box>
    </Container>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
