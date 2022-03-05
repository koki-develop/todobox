import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { useCallback } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { ulid } from "ulid";
import { projectsState } from "@/atoms/projectAtoms";
import { Project, CreateProjectInput } from "@/models/project";
import { firestore } from "@/lib/firebase";

/*
 * ヘルパー
 */

const updateOrAddProject = (
  projects: Project[],
  projectToAddOrUpdate: Project
): Project[] => {
  if (
    projects.some((prevProject) => prevProject.id === projectToAddOrUpdate.id)
  ) {
    return projects.map((prevProject) => {
      if (prevProject.id === projectToAddOrUpdate.id) {
        return projectToAddOrUpdate;
      } else {
        return prevProject;
      }
    });
  } else {
    return [...projects, projectToAddOrUpdate];
  }
};

/*
 * ステート管理
 */

export const useProjects = (): Project[] => {
  return useRecoilValue(projectsState);
};

export const useSetProjects = () => {
  return useSetRecoilState(projectsState);
};

export const useProjectsState = () => {
  return useRecoilState(projectsState);
};

/*
 * 読み取り
 */

export type ListenProjectFn = (callback?: () => void) => Unsubscribe;

export const useListenProjects = (userId: string): ListenProjectFn => {
  const setProjects = useSetProjects();

  const listenProjects: ListenProjectFn = useCallback(
    (callback?: () => void) => {
      const ref = collection(firestore, "users", userId, "projects");

      return onSnapshot(ref, (snapshot) => {
        const projects: Project[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Project)
        );
        setProjects(projects);
        callback?.();
      });
    },
    [setProjects, userId]
  );

  return listenProjects;
};

/*
 * 書き込み
 */

export type CreateProjectFn = (input: CreateProjectInput) => Promise<void>;

export const useCreateProjrect = (userId: string) => {
  const setProjects = useSetProjects();

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      const project: Project = { id: ulid(), ...input };
      const { id, ...data } = project;

      const ref = doc(firestore, "users", userId, "projects", id);

      await setDoc(ref, data);
      setProjects((prev) => {
        return updateOrAddProject(prev, project);
      });
    },
    [setProjects, userId]
  );

  return createProject;
};

export type DeleteProjectFn = (id: string) => Promise<void>;

export const useDeleteProject = (userId: string) => {
  const setProjects = useSetProjects();

  const deleteProject = useCallback(
    async (projectId: string) => {
      const ref = doc(firestore, "users", userId, "projects", projectId);
      await deleteDoc(ref);
      setProjects((prev) => {
        return prev.filter((prevProject) => prevProject.id !== projectId);
      });
    },
    [setProjects, userId]
  );

  return deleteProject;
};
