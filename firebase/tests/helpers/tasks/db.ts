import firebase from "firebase/compat";

export const listTasksCounterShards = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  const shardsRef = await _getTasksCounterShardsRef(db, uid, projectId);
  return shardsRef.get();
};

export const getTasksCounterShard = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  const shardRef = await _getTasksCounterShardRef(db, uid, projectId, shardId);
  return shardRef.get();
};

export const createTasksCounterShard = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string,
  input: unknown
) => {
  const shardRef = await _getTasksCounterShardRef(db, uid, projectId, shardId);
  return shardRef.set(input);
};

export const updateTasksCounterShard = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string,
  input: unknown
) => {
  const shardRef = await _getTasksCounterShardRef(db, uid, projectId, shardId);
  return shardRef.update(input);
};

export const deleteTasksCounterShard = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  const shardRef = await _getTasksCounterShardRef(db, uid, projectId, shardId);
  return shardRef.delete();
};

const _getTasksCounterShardsRef = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  return db.collection(
    `users/${uid}/projects/${projectId}/counters/tasks/shards`
  );
};

const _getTasksCounterShardRef = async (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  const shardsRef = await _getTasksCounterShardsRef(db, uid, projectId);
  return shardsRef.doc(shardId);
};
