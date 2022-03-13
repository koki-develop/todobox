import {
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  onSnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { ulid } from "ulid";
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/models/project";
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

export const updateProject = async (
  userId: string,
  project: Project
): Promise<void> => {
  const { id, ...data } = project;
  const ref = doc(firestore, "users", userId, "projects", id);
  await updateDoc(ref, { ...data });
};

export const deleteProject = async (
  userId: string,
  projectId: string
): Promise<void> => {
  const ref = doc(firestore, "users", userId, "projects", projectId);
  await deleteDoc(ref);
};

export class ProjectsRepository {
  public static build(input: CreateProjectInput): Project {
    const id = ulid();
    return { id, ...input };
  }

  public static async create(userId: string, project: Project): Promise<void> {
    const { id, ...data } = project;
    const ref = this._getProjectRef(userId, id);
    await setDoc(ref, data);
  }

  public static async update(
    userId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<void> {
    const ref = this._getProjectRef(userId, projectId);
    await updateDoc(ref, { ...input });
  }

  public static async delete(userId: string, projectId: string): Promise<void> {
    const ref = this._getProjectRef(userId, projectId);
    await deleteDoc(ref);
  }

  private static _getProjectRef(
    userId: string,
    projectId: string
  ): DocumentReference {
    return doc(firestore, "users", userId, "projects", projectId);
  }
}

export class ProjectsStateHelper {
  public static create(prev: Project[], project: Project): Project[] {
    return this._addOrUpdate(prev, project);
  }

  public static update(prev: Project[], project: Project): Project[] {
    return this._update(prev, project);
  }

  public static delete(prev: Project[], projectId: string): Project[] {
    return this._delete(prev, projectId);
  }

  private static _update(prev: Project[], project: Project): Project[] {
    return prev.map((prevProject) => {
      if (prevProject.id !== project.id) {
        return prevProject;
      }
      return project;
    });
  }

  private static _addOrUpdate(prev: Project[], project: Project): Project[] {
    if (!prev.some((prevProject) => prevProject.id === project.id)) {
      return [...prev, project];
    }

    return prev.map((prevProject) => {
      if (prevProject.id !== project.id) {
        return prevProject;
      }
      return project;
    });
  }

  private static _delete(prev: Project[], projectId: string): Project[] {
    return prev.filter((prevProject) => prevProject.id !== projectId);
  }
}
