import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  WriteBatch,
  Unsubscribe,
  Query,
  QuerySnapshot,
  DocumentReference,
  writeBatch,
} from "firebase/firestore";
import { ulid } from "ulid";
import {
  Section,
  CreateSectionInput,
  UpdateSectionInput,
} from "@/models/section";
import { firestore } from "@/lib/firebase";

export class SectionsRepository {
  /*
   * read
   */

  public static listenAll(
    userId: string,
    projectId: string,
    callback: (sections: Section[]) => void
  ): Unsubscribe {
    const q = this._getSectionsQuery(userId, projectId);
    return onSnapshot(q, (snapshot) => {
      const sections = this._querySnapshotToSections(snapshot);
      callback(sections);
    });
  }

  /*
   * write
   */

  public static build(input: CreateSectionInput): Section {
    return { id: ulid(), ...input };
  }

  public static async create(
    userId: string,
    projectId: string,
    section: Section
  ): Promise<void> {
    const { id, ...data } = section;
    const ref = this._getSectionRef(userId, projectId, id);
    await setDoc(ref, data);
  }

  public static async update(
    userId: string,
    projectId: string,
    sectionId: string,
    input: UpdateSectionInput
  ): Promise<void> {
    const ref = this._getSectionRef(userId, projectId, sectionId);
    await updateDoc(ref, { ...input });
  }

  public static async updateSections(
    userId: string,
    projectId: string,
    inputs: { [id: string]: UpdateSectionInput }
  ): Promise<void> {
    const batch = writeBatch(firestore);
    this.updateSectionsBatch(batch, userId, projectId, inputs);
    await batch.commit();
  }

  public static updateSectionsBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    inputs: { [id: string]: UpdateSectionInput }
  ): void {
    for (const [id, input] of Object.entries(inputs)) {
      const ref = this._getSectionRef(userId, projectId, id);
      batch.update(ref, { ...input });
    }
  }

  public static deleteBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    sectionId: string
  ): void {
    const ref = this._getSectionRef(userId, projectId, sectionId);
    batch.delete(ref);
  }

  /*
   * private
   */

  private static _getSectionRef(
    userId: string,
    projectId: string,
    sectionId: string
  ): DocumentReference {
    return doc(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "sections",
      sectionId
    );
  }

  private static _getSectionsQuery(userId: string, projectId: string): Query {
    const ref = collection(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "sections"
    );
    return query(ref, orderBy("index"));
  }

  private static _querySnapshotToSections(snapshot: QuerySnapshot): Section[] {
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Section)
    );
  }
}
