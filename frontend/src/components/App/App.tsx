import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "@/components/pages/LoginPage";
import ProjectsPage from "@/components/pages/ProjectsPage";

const App: React.VFC = React.memo(() => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </BrowserRouter>
  );
});

App.displayName = "App";

export default App;
