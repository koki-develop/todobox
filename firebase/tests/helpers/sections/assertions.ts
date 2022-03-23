import firebase from "firebase/compat";
import { assert, AssertResult } from "../assertions";
import {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
} from "./db";

export const assertListSections = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assert(expected, "list sections", () => listSections(db, uid, projectId));
};

export const assertGetSection = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  assert(expected, "get section", () =>
    getSection(db, uid, projectId, sectionId)
  );
};

export const assertCreateSection = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string,
  input: unknown
) => {
  assert(expected, "create section", () =>
    createSection(db, uid, projectId, sectionId, input)
  );
};

export const assertUpdateSection = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string,
  input: unknown
) => {
  assert(expected, "update section", () =>
    updateSection(db, uid, projectId, sectionId, input)
  );
};

export const assertDeleteSection = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  assert(expected, "delete section", () =>
    deleteSection(db, uid, projectId, sectionId)
  );
};
