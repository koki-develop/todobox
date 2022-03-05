import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import AuthProvider from "@/components/providers/AuthProvider";
import AppRoutes from "./AppRoutes";

const App: React.VFC = React.memo(() => {
  return (
    <RecoilRoot>
      <AuthProvider>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </RecoilRoot>
  );
});

App.displayName = "App";

export default App;
