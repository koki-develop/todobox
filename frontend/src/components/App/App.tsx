import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import LoginPage from "@/components/pages/LoginPage";
import NotFoundPage from "@/components/pages/NotFoundPage";
import ProjectPage from "@/components/pages/ProjectPage";
import ProjectsPage from "@/components/pages/ProjectsPage";

const App: React.VFC = React.memo(() => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
});

App.displayName = "App";

export default App;
