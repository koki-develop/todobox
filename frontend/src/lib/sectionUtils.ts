import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  WriteBatch,
  writeBatch,
  Unsubscribe,
  Query,
  QuerySnapshot,
  DocumentReference,
} from "firebase/firestore";
import { ulid } from "ulid";
import {
  Section,
  CreateSectionInput,
  UpdateSectionInput,
} from "@/models/section";
import { arrayMove } from "@/lib/arrayUtils";
import { firestore } from "@/lib/firebase";

/*
 * ヘルパー
 */

export const buildSection = (input: CreateSectionInput): Section => {
  return { id: ulid(), ...input };
};

export const sortSectionsState = (prev: Section[]): Section[] => {
  return prev.concat().sort((a, b) => a.index - b.index);
};

export const indexSectionsState = (prev: Section[]): Section[] => {
  return prev.map((prevSection, i) => ({ ...prevSection, index: i }));
};

export const updateOrAddSectionState = (
  prev: Section[],
  sectionToAddOrUpdate: Section
): Section[] => {
  if (prev.some((prevSection) => prevSection.id === sectionToAddOrUpdate.id)) {
    return sortSectionsState(
      prev.map((prevSection) => {
        if (prevSection.id === sectionToAddOrUpdate.id) {
          return sectionToAddOrUpdate;
        } else {
          return prevSection;
        }
      })
    );
  } else {
    return sortSectionsState([...prev, sectionToAddOrUpdate]);
  }
};

export const deleteSectionState = (
  prev: Section[],
  sectionId: string
): Section[] => {
  return indexSectionsState(
    prev.filter((prevSection) => prevSection.id !== sectionId)
  );
};

export const moveSectionState = (
  prev: Section[],
  fromIndex: number,
  toIndex: number
): Section[] => {
  return indexSectionsState(
    arrayMove(sortSectionsState(prev), fromIndex, toIndex)
  );
};

/*
 * 読み取り
 */

export const listenSections = (
  userId: string,
  projectId: string,
  callback: (sections: Section[]) => void
): Unsubscribe => {
  const ref = collection(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "sections"
  );
  const q = query(ref, orderBy("index"));
  return onSnapshot(q, (snapshot) => {
    const sections: Section[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          projectId: projectId,
          ...doc.data(),
        } as Section)
    );
    callback(sections);
  });
};

/*
 * 書き込み
 */

export const createSection = async (
  userId: string,
  section: Section
): Promise<void> => {
  const { id, projectId, ...data } = section;
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "sections",
    id
  );
  await setDoc(ref, data);
};

export const updateSection = async (
  userId: string,
  section: Section
): Promise<void> => {
  const { id, projectId, ...data } = section;
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "sections",
    id
  );
  await updateDoc(ref, { ...data });
};

export const updateSections = async (
  userId: string,
  sections: Section[]
): Promise<void> => {
  const batch = writeBatch(firestore);
  updateSectionsBatch(batch, userId, sections);
  await batch.commit();
};

export const updateSectionsBatch = (
  batch: WriteBatch,
  userId: string,
  sections: Section[]
): void => {
  for (const section of sections) {
    const { id, projectId, ...data } = section;
    const ref = doc(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "sections",
      id
    );
    batch.update(ref, { ...data });
  }
};

export const deleteSection = async (
  userId: string,
  projectId: string,
  sectionId: string
): Promise<void> => {
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "sections",
    sectionId
  );
  await deleteDoc(ref);
};

export const deleteSectionBatch = (
  batch: WriteBatch,
  userId: string,
  projectId: string,
  sectionId: string
): void => {
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "sections",
    sectionId
  );
  batch.delete(ref);
};

export class SectionsRepository {
  public static build(input: CreateSectionInput): Section {
    return { id: ulid(), ...input };
  }

  public static writeBatch(): WriteBatch {
    return writeBatch(firestore);
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

  public static updateSectionsBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    sections: Section[]
  ): void {
    for (const section of sections) {
      const { id, ...data } = section;
      const ref = doc(
        firestore,
        "users",
        userId,
        "projects",
        projectId,
        "sections",
        id
      );
      batch.update(ref, { ...data });
    }
  }

  public static deleteSectionBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    sectionId: string
  ): void {
    const ref = doc(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "sections",
      sectionId
    );
    batch.delete(ref);
  }

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

export class SectionsStateHelper {
  public static create(prev: Section[], section: Section): Section[] {
    return this._addOrUpdate(prev, section);
  }

  public static update(prev: Section[], section: Section): Section[] {
    return this._update(prev, section);
  }

  public static delete(prev: Section[], sectionId: string): Section[] {
    return this._index(
      prev.filter((prevSection) => prevSection.id !== sectionId)
    );
  }

  private static _addOrUpdate(prev: Section[], section: Section): Section[] {
    if (prev.some((prevSection) => prevSection.id === section.id)) {
      return this._update(prev, section);
    } else {
      return this._sort([...prev, section]);
    }
  }

  private static _update(prev: Section[], section: Section): Section[] {
    return this._sort(
      prev.map((prevSection) => {
        if (prevSection.id === section.id) {
          return section;
        } else {
          return prevSection;
        }
      })
    );
  }

  private static _sort(prev: Section[]): Section[] {
    return prev.concat().sort((a, b) => a.index - b.index);
  }

  private static _index(prev: Section[]): Section[] {
    return prev.map((prevSection, i) => ({ ...prevSection, index: i }));
  }
}
