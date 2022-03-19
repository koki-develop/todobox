import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
  writeBatch,
  WriteBatch,
} from "firebase/firestore";
import { ulid } from "ulid";
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/models/project";
import { firestore } from "@/lib/firebase";

export class ProjectsRepository {
  public static build(input: CreateProjectInput): Project {
    const id = ulid();
    return { id, ...input };
  }

  public static listen(
    userId: string,
    projectId: string,
    callback: (project: Project | null) => void
  ): Unsubscribe {
    const ref = this._getProjectRef(userId, projectId);
    return onSnapshot(ref, (snapshot) => {
      const project = this._documentSnapshotToProject(snapshot);
      callback(project);
    });
  }

  public static listenAll(
    userId: string,
    callback: (projects: Project[]) => void
  ): Unsubscribe {
    const ref = this._getProjectsRef(userId);
    return onSnapshot(ref, (snapshot) => {
      const projects = this._querySnapshotToProjects(snapshot);
      callback(projects);
    });
  }

  public static async create(userId: string, project: Project): Promise<void> {
    const { id, ...data } = project;
    const ref = this._getProjectRef(userId, id);
    await setDoc(ref, data);
  }

  public static createBatch(
    batch: WriteBatch,
    userId: string,
    project: Project
  ): void {
    const { id, ...data } = project;
    const ref = this._getProjectRef(userId, id);
    batch.set(ref, data);
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

  public static writeBatch(): WriteBatch {
    return writeBatch(firestore);
  }

  public static commitBatch(batch: WriteBatch): Promise<void> {
    return batch.commit();
  }

  private static _documentSnapshotToProject(
    snapshot: DocumentSnapshot
  ): Project | null {
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Project;
    } else {
      return null;
    }
  }

  private static _querySnapshotToProjects(snapshot: QuerySnapshot): Project[] {
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Project)
    );
  }

  private static _getProjectsRef(userId: string): CollectionReference {
    return collection(firestore, "users", userId, "projects");
  }

  private static _getProjectRef(
    userId: string,
    projectId: string
  ): DocumentReference {
    return doc(firestore, "users", userId, "projects", projectId);
  }
}
