import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { projectsInitializedState, projectsState } from "@/atoms/projectAtoms";
import {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from "@/models/project";
import { ProjectsRepository, ProjectsStateHelper } from "@/lib/projectUtils";
import { useToast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/userHooks";

export const useProjects = () => {
  const { currentUser } = useCurrentUser();
  const { showToast } = useToast();

  const projectsInitialized = useRecoilValue(projectsInitializedState);
  const [projects, setProjects] = useRecoilState(projectsState);

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      if (!currentUser) return;
      const project = ProjectsRepository.build(input);
      await ProjectsRepository.create(currentUser.uid, project).then(() => {
        showToast("プロジェクトを作成しました。", "success");
        setProjects((prev) => {
          return ProjectsStateHelper.create(prev, project);
        });
      });
    },
    [currentUser, setProjects, showToast]
  );

  const updateProject = useCallback(
    async (project: Project, input: UpdateProjectInput) => {
      if (!currentUser) return;
      const updatedProject = { ...project, ...input };
      await ProjectsRepository.update(currentUser.uid, project.id, input).then(
        () => {
          showToast("プロジェクトを更新しました。", "success");
          setProjects((prev) => {
            return ProjectsStateHelper.update(prev, updatedProject);
          });
        }
      );
    },
    [currentUser, setProjects, showToast]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!currentUser) return;
      await ProjectsRepository.delete(currentUser.uid, projectId).then(() => {
        showToast("プロジェクトを削除しました。", "success");
        setProjects((prev) => {
          return ProjectsStateHelper.delete(prev, projectId);
        });
      });
    },
    [currentUser, setProjects, showToast]
  );

  return {
    projectsInitialized,
    projects,
    createProject,
    updateProject,
    deleteProject,
  };
};
