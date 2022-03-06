import AppBar from "@mui/material/AppBar";
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";

const Layout: React.VFC = React.memo(() => {
  const { initialized } = useAuth();

  if (!initialized) {
    return <Outlet />;
  }

  return (
    <div>
      <AppBar position="static">hogefuga</AppBar>
      <Outlet />
    </div>
  );
});

Layout.displayName = "Layout";

export default Layout;
