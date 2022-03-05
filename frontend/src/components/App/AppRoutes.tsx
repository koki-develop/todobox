import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/components/pages/LoginPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import ProjectPage from "@/components/pages/ProjectPage";
import ProjectsPage from "@/components/pages/ProjectsPage";
import { auth } from "@/lib/firebase";

const AppRoutes: React.VFC = React.memo(() => {
  const [currentUser, loading] = useAuthState(auth);

  if (loading) {
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
        element={currentUser ? <ProjectPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="*"
        element={currentUser ? <NotFoundPage /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
});

AppRoutes.displayName = "AppRoutes";

export default AppRoutes;
