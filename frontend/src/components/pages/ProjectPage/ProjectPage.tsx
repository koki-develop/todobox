import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Project } from "@/models/project";

const ProjectPage: React.VFC = React.memo(() => {
  const params = useParams();
  const id = params.id as string;

  const [projectLoaded, setProjectLoaded] = useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjectLoaded(false);
    const timeoutId = setTimeout(() => {
      setProjectLoaded(true);
      setProject({ id, name: "sample project" });
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [id]);

  if (!projectLoaded) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <div>id: {id}</div>
    </div>
  );
});

ProjectPage.displayName = "ProjectPage";

export default ProjectPage;
