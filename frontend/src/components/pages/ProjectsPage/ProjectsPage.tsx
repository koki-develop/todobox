import { signOut, User } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
  useProjects,
  useListenProjects,
  useCreateProjrect,
  useDeleteProject,
} from "@/hooks/projectHooks";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const [creatingProject, setCreatingProject] = useState<boolean>(false);
  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);

  const projects = useProjects();
  const listenProjects = useListenProjects(currentUser.uid);
  const createProject = useCreateProjrect(currentUser.uid);
  const deleteProject = useDeleteProject(currentUser.uid);

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

    setCreatingProject(true);
    createProject({ name: trimmedName }).finally(() => {
      setCreatingProject(false);
    });
  }, [createProject, name]);

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      deleteProject(projectId);
    },
    [deleteProject]
  );

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
        <button onClick={handleCreateProject} disabled={creatingProject}>
          create
        </button>
      </div>

      <div>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <span>
                <Link to={`/projects/${project.id}`}>{project.name}</Link>
              </span>
              <span>
                <button onClick={() => handleDeleteProject(project.id)}>
                  delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

ProjectsPage.displayName = "ProjectsPage";

export default ProjectsPage;
