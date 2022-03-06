import { signOut, User } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import ProjectList from "@/components/model/project/ProjectList";
import { Project } from "@/models/project";
import { auth } from "@/lib/firebase";
import {
  buildProject,
  createProject,
  deleteProject,
  deleteProjectState,
  listenProjects,
  updateOrAddProjectState,
} from "@/lib/projectUtils";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const [creatingProject, setCreatingProject] = useState<boolean>(false);
  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState<string>("");

  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    []
  );

  const handleCreateProject = useCallback(async () => {
    const trimmedName = name.trim();
    if (trimmedName === "") return;

    setCreatingProject(true);
    const project = buildProject({ name: trimmedName });

    createProject(currentUser.uid, project)
      .then(() => {
        setName("");
        setProjects((prev) => {
          return updateOrAddProjectState(prev, project);
        });
      })
      .finally(() => {
        setCreatingProject(false);
      });
  }, [currentUser.uid, name]);

  const handleDeleteProject = useCallback(
    (project: Project) => {
      deleteProject(currentUser.uid, project.id).then(() => {
        setProjects((prev) => {
          return deleteProjectState(prev, project.id);
        });
      });
    },
    [currentUser.uid]
  );

  useEffect(() => {
    const unsubscribe = listenProjects(currentUser.uid, (projects) => {
      setProjectsLoaded(true);
      setProjects(projects);
    });
    return unsubscribe;
  }, [currentUser.uid]);

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
        <ProjectList
          projects={projects}
          onDeleteProject={handleDeleteProject}
        />
      </div>
    </div>
  );
});

ProjectsPage.displayName = "ProjectsPage";

export default ProjectsPage;
