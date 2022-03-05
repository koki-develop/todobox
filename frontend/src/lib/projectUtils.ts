import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { ulid } from "ulid";
import { Project, CreateProjectInput } from "@/models/project";
import { firestore } from "@/lib/firebase";

/*
 * ヘルパー
 */

export const buildProject = (input: CreateProjectInput): Project => {
  const id = ulid();
  return { id, ...input };
};

export const updateOrAddProjectState = (
  prev: Project[],
  projectToAddOrUpdate: Project
): Project[] => {
  if (prev.some((prevProject) => prevProject.id === projectToAddOrUpdate.id)) {
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
};

export const deleteProjectState = (
  prev: Project[],
  projectId: string
): Project[] => {
  return prev.filter((prevProject) => prevProject.id !== projectId);
};

/*
 * 読み取り
 */

export const listenProject = (
  userId: string,
  projectId: string,
  callback: (project: Project | null) => void
): Unsubscribe => {
  const ref = doc(firestore, "users", userId, "projects", projectId);
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Project);
    } else {
      callback(null);
    }
  });
};

export const listenProjects = (
  userId: string,
  callback: (projects: Project[]) => void
): Unsubscribe => {
  const ref = collection(firestore, "users", userId, "projects");
  return onSnapshot(ref, (snapshot) => {
    const projects: Project[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Project)
    );
    callback(projects);
  });
};

/*
 * 書き込み
 */

export const createProject = async (
  userId: string,
  project: Project
): Promise<void> => {
  const { id, ...data } = project;
  const ref = doc(firestore, "users", userId, "projects", id);
  await setDoc(ref, data);
};

export const deleteProject = async (
  userId: string,
  projectId: string
): Promise<void> => {
  const ref = doc(firestore, "users", userId, "projects", projectId);
  await deleteDoc(ref);
};
