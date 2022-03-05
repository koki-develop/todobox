import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/components/pages/LoginPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import ProjectPage from "@/components/pages/ProjectPage";
import ProjectsPage from "@/components/pages/ProjectsPage";
import { useAuth } from "@/components/providers/AuthProvider";
import Layout from "@/components/Layout";

const AppRoutes: React.VFC = React.memo(() => {
  const { initialized, currentUser } = useAuth();

  if (!initialized) {
    return <div>loading...</div>;
  }

  // TODO: リファクタ
  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser ? <Navigate to="/projects" replace /> : <LoginPage />
        }
      />
      <Route element={<Layout />}>
        <Route
          path="/projects"
          element={
            currentUser ? (
              <ProjectsPage currentUser={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/projects/:id"
          element={
            currentUser ? (
              <ProjectPage currentUser={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Route>
      <Route
        path="*"
        element={currentUser ? <NotFoundPage /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
});

AppRoutes.displayName = "AppRoutes";

export default AppRoutes;
