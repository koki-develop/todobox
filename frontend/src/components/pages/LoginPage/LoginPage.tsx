import GoogleIcon from "@mui/icons-material/Google";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import {
  signInWithRedirect,
  signInAnonymously,
  GoogleAuthProvider,
} from "firebase/auth";
import React, { useCallback } from "react";
import { auth } from "@/lib/firebase";

const Field = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  ":not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const LoginPage: React.VFC = React.memo(() => {
  const handleClickLoginWithGoogle = useCallback(() => {
    signInWithRedirect(auth, new GoogleAuthProvider());
  }, []);

  const handleClickLoginAnonymously = useCallback(() => {
    signInAnonymously(auth);
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 20 }}>
      <Paper sx={{ p: 4 }} elevation={10}>
        <Field>
          <Typography>TODO BOX</Typography>
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
