import firebase from "firebase/compat";

export const listSections = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return _getSectionsRef(db, uid, projectId).get();
};

export const getSection = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  return _getSectionRef(db, uid, projectId, sectionId).get();
};

export const createSection = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string,
  input: unknown
) => {
  return _getSectionRef(db, uid, projectId, sectionId).set(input);
};

export const updateSection = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string,
  input: unknown
) => {
  return _getSectionRef(db, uid, projectId, sectionId).update(input);
};

export const deleteSection = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  return _getSectionRef(db, uid, projectId, sectionId).delete();
};

const _getSectionsRef = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return db.collection(`users/${uid}/projects/${projectId}/sections`);
};

const _getSectionRef = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  const sectionsRef = _getSectionsRef(db, uid, projectId);
  return sectionsRef.doc(sectionId);
};
