import {
  collection,
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

const useUpdateOrAddProjectState = () => {
  const setProjects = useSetProjects();

  const updateOrAddProjectState = useCallback(
    (projectToAddOrUpdate: Project) => {
      setProjects((prev) => {
        if (
          prev.some((prevProject) => prevProject.id === projectToAddOrUpdate.id)
        ) {
          return prev.map((prevProject) => {
            if (prevProject.id === projectToAddOrUpdate.id) {
              return projectToAddOrUpdate;
            } else {
              return prevProject;
            }
          });
        } else {
          return [...prev, projectToAddOrUpdate];
        }
      });
    },
    [setProjects]
  );

  return updateOrAddProjectState;
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
  const updateOrAddProjectState = useUpdateOrAddProjectState();

  const createProject = useCallback(
    (input: CreateProjectInput) => {
      const project: Project = { id: ulid(), ...input };
      const { id, ...data } = project;

      const ref = doc(firestore, "users", userId, "projects", id);

      return setDoc(ref, data).then(() => {
        updateOrAddProjectState(project);
      });
    },
    [updateOrAddProjectState, userId]
  );

  return createProject;
};
