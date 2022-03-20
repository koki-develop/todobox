import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AccountPage from "@/components/pages/AccountPage";
import LoginPage from "@/components/pages/LoginPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import ProjectPage from "@/components/pages/ProjectPage";
import ProjectsPage from "@/components/pages/ProjectsPage";
import Loading from "@/components/utils/Loading";
import ProjectLayout from "@/components/ProjectLayout";
import { useCurrentUser } from "@/hooks/userHooks";

type WithAuthOptions = {
  loginPage?: boolean;
};

const withAuth = (options?: WithAuthOptions) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WithAuth = (Component: React.VFC<any>) => {
    const { initialized, currentUser } = useCurrentUser();

    if (!initialized) {
      return <Loading />;
    }

    if (options?.loginPage) {
      if (currentUser) {
        return <Navigate to="/projects" />;
      } else {
        return React.createElement(Component);
      }
    }

    if (currentUser) {
      return React.createElement(Component, { currentUser });
    } else {
      return <Navigate to="/" />;
    }
  };
  return WithAuth;
};

const AppRoutes: React.VFC = React.memo(() => {
  return (
    <Routes>
      <Route path="/" element={withAuth({ loginPage: true })(LoginPage)} />
      <Route element={<ProjectLayout />}>
        <Route path="/projects" element={withAuth()(ProjectsPage)} />
        <Route path="/projects/:id" element={withAuth()(ProjectPage)} />
        <Route path="/account" element={withAuth()(AccountPage)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
});

AppRoutes.displayName = "AppRoutes";

export default AppRoutes;
