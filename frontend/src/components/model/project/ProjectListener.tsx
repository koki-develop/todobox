import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { projectInitializedState, projectState } from "@/atoms/projectAtoms";
import { ProjectsRepository } from "@/lib/projectUtils";
import { useCurrentUser } from "@/hooks/userHooks";

export type ProjectListenerProps = {
  projectId: string;
};

const ProjectListener: React.VFC<ProjectListenerProps> = React.memo((props) => {
  const { projectId } = props;

  const { currentUser } = useCurrentUser();

  const setProjectInitialized = useSetRecoilState(projectInitializedState);
  const setProject = useSetRecoilState(projectState);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = ProjectsRepository.listen(
      currentUser.uid,
      projectId,
      (project) => {
        setProject(project);
        setProjectInitialized(true);
      }
    );
    return () => {
      unsubscribe();
      setProjectInitialized(false);
      setProject(null);
    };
  }, [currentUser, projectId, setProject, setProjectInitialized]);

  return null;
});

ProjectListener.displayName = "ProjectListener";

export default ProjectListener;
