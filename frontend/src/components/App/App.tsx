import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import AppRoutes from "./AppRoutes";

const App: React.VFC = React.memo(() => {
  return (
    <RecoilRoot>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RecoilRoot>
  );
});

App.displayName = "App";

export default App;
