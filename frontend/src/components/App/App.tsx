import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { theme } from "@/components/Layout/theme";
import AuthProvider from "@/components/providers/AuthProvider";
import ProjectsProvider from "@/components/providers/ProjectsProvider";
import AppRoutes from "./AppRoutes";

const App: React.VFC = React.memo(() => {
  return (
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <AuthProvider>
          <ProjectsProvider>
            <CssBaseline />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ProjectsProvider>
        </AuthProvider>
      </RecoilRoot>
    </ThemeProvider>
  );
});

App.displayName = "App";

export default App;
