import { signOut, User } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
  useProjects,
  useListenProjects,
  useCreateProjrect,
} from "@/hooks/projectHooks";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);

  const projects = useProjects();
  const listenProjects = useListenProjects(currentUser.uid);
  const createProject = useCreateProjrect(currentUser.uid);

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

    createProject({ name: trimmedName });
  }, [createProject, name]);

  useEffect(() => {
    const unsubscribe = listenProjects(() => {
      setProjectsLoaded(true);
    });
    return unsubscribe;
  }, [listenProjects]);

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
