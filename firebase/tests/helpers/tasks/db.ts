import firebase from "firebase/compat";

export const listTasksCounterShards = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return _getTasksCounterShardsRef(db, uid, projectId).get();
};

export const getTasksCounterShard = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  return _getTasksCounterShardRef(db, uid, projectId, shardId).get();
};

export const createTasksCounterShard = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string,
  input: unknown
) => {
  return _getTasksCounterShardRef(db, uid, projectId, shardId).set(input);
};

export const updateTasksCounterShard = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string,
  input: unknown
) => {
  return _getTasksCounterShardRef(db, uid, projectId, shardId).update(input);
};

export const deleteTasksCounterShard = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  return _getTasksCounterShardRef(db, uid, projectId, shardId).delete();
};

const _getTasksCounterShardsRef = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return db.collection(
    `users/${uid}/projects/${projectId}/counters/tasks/shards`
  );
};

const _getTasksCounterShardRef = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  return _getTasksCounterShardsRef(db, uid, projectId).doc(shardId);
};
