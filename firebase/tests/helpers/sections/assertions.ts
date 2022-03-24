import firebase from "firebase/compat";
import { assertAction, AssertResult } from "../assertions";
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
  assertAction(expected, "list sections", () =>
    listSections(db, uid, projectId)
  );
};

export const assertGetSection = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  assertAction(expected, "get section", () =>
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
  assertAction(
    expected,
    `create section with input: ${JSON.stringify(input)}`,
    () => createSection(db, uid, projectId, sectionId, input)
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
  assertAction(
    expected,
    `update section with input: ${JSON.stringify(input)}`,
    () => updateSection(db, uid, projectId, sectionId, input)
  );
};

export const assertDeleteSection = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  assertAction(expected, "delete section", () =>
    deleteSection(db, uid, projectId, sectionId)
  );
};
