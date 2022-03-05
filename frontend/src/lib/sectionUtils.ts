import { Unsubscribe } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { ulid } from "ulid";
import { Section, CreateSectionInput } from "@/models/section";
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
  return prev.filter((prevSection) => prevSection.id !== sectionId);
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
  return onSnapshot(ref, (snapshot) => {
    const sections: Section[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
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
