import firebase from "firebase/compat";
import { assert, AssertResult } from "../assertions";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "./db";

export const assertListProjects = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string
) => {
  assert(expected, "list projects", () => listProjects(db, uid));
};

export const assertGetProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assert(expected, "get project", () => getProject(db, uid, projectId));
};

export const assertCreateProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  assert(expected, `create project with input: ${JSON.stringify(input)}`, () =>
    createProject(db, uid, projectId, input)
  );
};

export const assertUpdateProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  assert(expected, `update project with input: ${JSON.stringify(input)}`, () =>
    updateProject(db, uid, projectId, input)
  );
};

export const assertDeleteProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assert(expected, "delete project", () => deleteProject(db, uid, projectId));
};
