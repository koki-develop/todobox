import { signOut } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ulid } from "ulid";
import { Project } from "@/models/project";
import { auth } from "@/lib/firebase";

const dummyProjects: Project[] = [
  { id: ulid(), name: "project 1" },
  { id: ulid(), name: "project 2" },
];

const ProjectsPage: React.VFC = React.memo(() => {
  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState<string>("");

  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    []
  );

  const handleCreateProject = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName === "") return;
    setName("");
    const project: Project = { id: ulid(), name: trimmedName };
    setProjects((prev) => [...prev, project]);
  }, [name]);

  useEffect(() => {
    setProjectsLoaded(false);
    const timeoutId = setTimeout(() => {
      setProjectsLoaded(true);
      setProjects(dummyProjects);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (!projectsLoaded) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <button onClick={() => signOut(auth)}>signout</button>
      <div>
        <input type="text" value={name} onChange={handleChangeName} />
        <button onClick={handleCreateProject}>create</button>
      </div>

      <div>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>{project.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

ProjectsPage.displayName = "ProjectsPage";

export default ProjectsPage;
