import firebase from "firebase/compat";
import { assertAction, AssertResult } from "../assertions";
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
  assertAction(expected, "list projects", () => listProjects(db, uid));
};

export const assertGetProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assertAction(expected, "get project", () => getProject(db, uid, projectId));
};

export const assertCreateProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  assertAction(
    expected,
    `create project with id: ${projectId}, input: ${JSON.stringify(input)}`,
    () => createProject(db, uid, projectId, input)
  );
};

export const assertUpdateProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  assertAction(
    expected,
    `update project with input: ${JSON.stringify(input)}`,
    () => updateProject(db, uid, projectId, input)
  );
};

export const assertDeleteProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assertAction(expected, "delete project", () =>
    deleteProject(db, uid, projectId)
  );
};
