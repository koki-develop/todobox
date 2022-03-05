import React from "react";
import { Outlet } from "react-router-dom";

const Layout: React.VFC = React.memo(() => {
  return (
    <div>
      <Outlet />
    </div>
  );
});

Layout.displayName = "Layout";

export default Layout;
