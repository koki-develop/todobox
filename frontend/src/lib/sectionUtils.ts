import { Unsubscribe } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { ulid } from "ulid";
import { Section, CreateSectionInput } from "@/models/section";
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

export const updateSections = async (
  userId: string,
  sections: Section[]
): Promise<void> => {
  const batch = writeBatch(firestore);
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
    batch.set(ref, { ...data });
  }

  await batch.commit();
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
