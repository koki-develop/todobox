import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import ProjectsListener from "@/components/model/project/ProjectsListener";
import CurrentUserListener from "@/components/model/user/CurrentUserListener";
import { theme } from "@/components/ProjectLayout/theme";
import AppRoutes from "./AppRoutes";

const App: React.VFC = React.memo(() => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        maxSnack={3}
        autoHideDuration={3000}
      >
        <RecoilRoot>
          <CurrentUserListener />
          <ProjectsListener />
          <CssBaseline />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RecoilRoot>
      </SnackbarProvider>
    </ThemeProvider>
  );
});

App.displayName = "App";

export default App;
