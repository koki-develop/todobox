import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useCurrentUser } from "@/components/model/user/userHooks";
import { projectsInitializedState, projectsState } from "@/atoms/projectAtoms";
import { CreateProjectInput } from "@/models/project";
import {
  buildProject,
  createProject as createProjectApi,
  updateOrAddProjectState,
} from "@/lib/projectUtils";
import { useToast } from "@/hooks/useToast";

export const useProjects = () => {
  const { currentUser } = useCurrentUser();
  const { showToast } = useToast();

  const initialized = useRecoilValue(projectsInitializedState);
  const [projects, setProjects] = useRecoilState(projectsState);

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      if (!currentUser) return;
      const project = buildProject(input);
      await createProjectApi(currentUser.uid, project).then(() => {
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
