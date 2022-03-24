import firebase from "firebase/compat";

export const listProjects = (db: firebase.firestore.Firestore, uid: string) => {
  return _getProjectsRef(db, uid).get();
};

export const getProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return _getProjectRef(db, uid, projectId).get();
};

export const createProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  return _getProjectRef(db, uid, projectId).set(input);
};

export const updateProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  return _getProjectRef(db, uid, projectId).update(input);
};

export const deleteProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return _getProjectRef(db, uid, projectId).delete();
};

const _getProjectsRef = (db: firebase.firestore.Firestore, uid: string) => {
  return db.collection(`users/${uid}/projects`);
};

const _getProjectRef = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return _getProjectsRef(db, uid).doc(projectId);
};
