import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useRecoilValue } from "recoil";
import LoginPage from "@/components/pages/LoginPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import ProjectPage from "@/components/pages/ProjectPage";
import ProjectsPage from "@/components/pages/ProjectsPage";
import { authenticatedUserState } from "@/atoms/userAtoms";

const AppRoutes: React.VFC = React.memo(() => {
  const authenticatedUser = useRecoilValue(authenticatedUserState);

  // TODO: リファクタ
  return (
    <Routes>
      <Route
        path="/"
        element={
          authenticatedUser ? (
            <Navigate to="/projects" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/projects"
        element={
          authenticatedUser ? <ProjectsPage /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/projects/:id"
        element={
          authenticatedUser ? <ProjectPage /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="*"
        element={
          authenticatedUser ? <NotFoundPage /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
});

AppRoutes.displayName = "AppRoutes";

export default AppRoutes;
