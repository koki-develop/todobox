import { assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import firebase from "firebase/compat";
import { it } from "vitest";
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
  assert(
    expected,
    {
      success: "should be able to list projects",
      fail: "should not be able to list projects",
    },
    () => listProjects(db, uid)
  );
};

export const assertGetProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  if (expected === "success") {
    it("should be able to get project", async () => {
      await assertSucceeds(getProject(db, uid, projectId));
    });
  } else {
    it("should not be able to get project", async () => {
      await assertFails(getProject(db, uid, projectId));
    });
  }
};

export const assertCreateProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  if (expected === "success") {
    it(`should be able to create project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertSucceeds(createProject(db, uid, projectId, input));
    });
  } else {
    it(`should not be able to create project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertFails(createProject(db, uid, projectId, input));
    });
  }
};

export const assertUpdateProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  if (expected === "success") {
    it(`should be able to update project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertSucceeds(updateProject(db, uid, projectId, input));
    });
  } else {
    it(`should not be able to update project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertFails(updateProject(db, uid, projectId, input));
    });
  }
};

export const assertDeleteProject = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  if (expected === "success") {
    it("should be able to delete project", async () => {
      await assertSucceeds(deleteProject(db, uid, projectId));
    });
  } else {
    it("should not be able to delete project", async () => {
      await assertFails(deleteProject(db, uid, projectId));
    });
  }
};
