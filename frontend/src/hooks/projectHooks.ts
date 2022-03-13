import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { projectsInitializedState, projectsState } from "@/atoms/projectAtoms";
import { CreateProjectInput } from "@/models/project";
import {
  updateOrAddProjectState,
  ProjectsRepository,
} from "@/lib/projectUtils";
import { useToast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/userHooks";

export const useProjects = () => {
  const { currentUser } = useCurrentUser();
  const { showToast } = useToast();

  const initialized = useRecoilValue(projectsInitializedState);
  const [projects, setProjects] = useRecoilState(projectsState);

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      if (!currentUser) return;
      const project = ProjectsRepository.build(input);
      await ProjectsRepository.create(currentUser.uid, project).then(() => {
        showToast("プロジェクトを作成しました。", "success");
        setProjects((prev) => {
          return updateOrAddProjectState(prev, project);
        });
      });
    },
    [currentUser, setProjects, showToast]
  );

  return {
    initialized,
    projects,
    createProject,
  };
};
