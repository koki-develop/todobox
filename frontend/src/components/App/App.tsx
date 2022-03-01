import React from "react";
import ProjectsPage from "@/components/pages/ProjectsPage";

const App: React.VFC = React.memo(() => {
  return (
    <div>
      <ProjectsPage />
    </div>
  );
});

App.displayName = "App";

export default App;
