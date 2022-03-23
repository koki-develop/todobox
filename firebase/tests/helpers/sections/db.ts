import firebase from "firebase/compat";

export const listSections = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  const sectionsRef = await _getSectionsRef(db, uid, projectId);
  return sectionsRef.get();
};

export const getSection = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  const sectionRef = await _getSectionRef(db, uid, projectId, sectionId);
  return sectionRef.get();
};

export const createSection = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string,
  input: unknown
) => {
  const sectionRef = await _getSectionRef(db, uid, projectId, sectionId);
  return sectionRef.set(input);
};

export const updateSection = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string,
  input: unknown
) => {
  const sectionRef = await _getSectionRef(db, uid, projectId, sectionId);
  return sectionRef.update(input);
};

export const deleteSection = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  const sectionRef = await _getSectionRef(db, uid, projectId, sectionId);
  return sectionRef.delete();
};

const _getSectionsRef = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return db.collection(`users/${uid}/projects/${projectId}/sections`);
};

const _getSectionRef = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  sectionId: string
) => {
  const sectionsRef = await _getSectionsRef(db, uid, projectId);
  return sectionsRef.doc(sectionId);
};
