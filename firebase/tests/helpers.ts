import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";
import firebase from "firebase/compat";
import { getTestEnvironment } from "./helpers/firebase";

export type DbOptions = {
  authenticateWith?: string;
};

export const cleanup = async () => {
  const env = await getTestEnvironment();
  await env.cleanup();
};

export const clearDb = async () => {
  const env = await getTestEnvironment();
  await env.clearFirestore();
};

export const getDb = async (options?: DbOptions) => {
  const env = await getTestEnvironment();
  const context = (() => {
    if (options?.authenticateWith) {
      return env.authenticatedContext(options.authenticateWith);
    } else {
      return env.unauthenticatedContext();
    }
  })();
  return context.firestore();
};

export const listProjects = async (
  db: firebase.firestore.Firestore,
  uid: string
) => {
  const projectsRef = await _getProjectsRef(db, uid);
  return projectsRef.get();
};

export const getProject = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  const projectRef = await _getProjectRef(db, uid, projectId);
  return projectRef.get();
};

export const createProject = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  const projectRef = await _getProjectRef(db, uid, projectId);
  return projectRef.set(input);
};

export const updateProject = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  const projectRef = await _getProjectRef(db, uid, projectId);
  return projectRef.update(input);
};

export const deleteProject = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  const projectRef = await _getProjectRef(db, uid, projectId);
  return projectRef.delete();
};

const _getProjectsRef = async (
  db: firebase.firestore.Firestore,
  uid: string
) => {
  return db.collection(`users/${uid}/projects`);
};

const _getProjectRef = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  const projectsRef = await _getProjectsRef(db, uid);
  return projectsRef.doc(projectId);
};
