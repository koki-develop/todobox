import { writeBatch } from "firebase/firestore";
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
import { firestore } from "@/lib/firebase";
import { ProjectsRepository } from "@/lib/projectsRepository";
import { ProjectsStateHelper } from "@/lib/projectsStateHelper";
import { TasksRepository } from "@/lib/tasksRepository";
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
      const batch = writeBatch(firestore);
      ProjectsRepository.createBatch(batch, currentUser.uid, project);
      TasksRepository.initializeCounterBatch(
        batch,
        currentUser.uid,
        project.id
      );
      await batch.commit();

      setProjects((prev) => ProjectsStateHelper.create(prev, project));
      showToast("プロジェクトを作成しました。", "success");
    },
    [currentUser, setProjects, showToast]
  );

  const updateProject = useCallback(
    async (project: Project, input: UpdateProjectInput) => {
      if (!currentUser) return;

      await ProjectsRepository.update(currentUser.uid, project.id, input);
      const updatedProject = { ...project, ...input };

      setProjects((prev) => {
        return ProjectsStateHelper.update(prev, updatedProject);
      });
      setProject((prev) =>
        prev?.id === updatedProject.id ? updatedProject : prev
      );
      showToast("プロジェクトを更新しました。", "success");
    },
    [currentUser, setProject, setProjects, showToast]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!currentUser) return;

      await ProjectsRepository.delete(currentUser.uid, projectId);

      setProjects((prev) => ProjectsStateHelper.delete(prev, projectId));
      setProject((prev) => (prev?.id === projectId ? null : prev));
      showToast("プロジェクトを削除しました。", "success");
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
