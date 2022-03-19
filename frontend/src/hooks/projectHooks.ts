import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  projectInitializedState,
  projectsInitializedState,
  projectsState,
  projectState,
} from "@/atoms/projectAtoms";
import {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from "@/models/project";
import { ProjectsStateHelper } from "@/lib/projectUtils";
import { ProjectsRepository } from "@/lib/projectsRepository";
import { TasksRepository } from "@/lib/taskUtils";
import { useToast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/userHooks";

export const useProjects = () => {
  const { currentUser } = useCurrentUser();
  const { showToast } = useToast();

  const projectInitialized = useRecoilValue(projectInitializedState);
  const [project, setProject] = useRecoilState(projectState);
  const projectsInitialized = useRecoilValue(projectsInitializedState);
  const [projects, setProjects] = useRecoilState(projectsState);

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      if (!currentUser) return;
      const project = ProjectsRepository.build(input);
      const batch = ProjectsRepository.writeBatch();
      await ProjectsRepository.createBatch(batch, currentUser.uid, project);
      await TasksRepository.initializeCounterBatch(
        batch,
        currentUser.uid,
        project.id
      );
      await ProjectsRepository.commitBatch(batch);
      showToast("プロジェクトを作成しました。", "success");
      setProjects((prev) => {
        return ProjectsStateHelper.create(prev, project);
      });
    },
    [currentUser, setProjects, showToast]
  );

  const updateProject = useCallback(
    async (project: Project, input: UpdateProjectInput) => {
      if (!currentUser) return;
      const updatedProject = { ...project, ...input };
      await ProjectsRepository.update(currentUser.uid, project.id, input);
      showToast("プロジェクトを更新しました。", "success");
      setProjects((prev) => {
        return ProjectsStateHelper.update(prev, updatedProject);
      });
      setProject((prev) => {
        if (prev?.id === updatedProject.id) {
          return updatedProject;
        } else {
          return prev;
        }
      });
    },
    [currentUser, setProject, setProjects, showToast]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!currentUser) return;
      await ProjectsRepository.delete(currentUser.uid, projectId);
      showToast("プロジェクトを削除しました。", "success");
      setProjects((prev) => {
        return ProjectsStateHelper.delete(prev, projectId);
      });
      setProject((prev) => {
        if (prev?.id === projectId) {
          return null;
        } else {
          return prev;
        }
      });
    },
    [currentUser, setProject, setProjects, showToast]
  );

  return {
    projectInitialized,
    project,
    projectsInitialized,
    projects,
    createProject,
    updateProject,
    deleteProject,
  };
};
