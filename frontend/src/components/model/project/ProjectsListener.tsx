import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { projectsInitializedState, projectsState } from "@/atoms/projectAtoms";
import { ProjectsRepository } from "@/lib/projectsRepository";
import { useCurrentUser } from "@/hooks/userHooks";

export type ProjectsListenerProps = {
  //
};

const ProjectsListener: React.VFC<ProjectsListenerProps> = React.memo(() => {
  const { currentUser } = useCurrentUser();

  const setProjectsInitialized = useSetRecoilState(projectsInitializedState);
  const setProjects = useSetRecoilState(projectsState);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = ProjectsRepository.listenAll(
      currentUser.uid,
      (projects) => {
        setProjects(projects);
        setProjectsInitialized(true);
      }
    );
    return () => {
      setProjects([]);
      setProjectsInitialized(false);
      unsubscribe();
    };
  }, [currentUser, setProjects, setProjectsInitialized]);

  return null;
});

ProjectsListener.displayName = "ProjectsListener";

export default ProjectsListener;
