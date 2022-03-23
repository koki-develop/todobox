import firebase from "firebase/compat";
import { assert, AssertResult } from "../assertions";
import {
  listTasksCounterShards,
  getTasksCounterShard,
  createTasksCounterShard,
  updateTasksCounterShard,
  deleteTasksCounterShard,
} from "./db";

export const assertListTasksCounterShards = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assert(expected, "list tasks counter shards", () =>
    listTasksCounterShards(db, uid, projectId)
  );
};

export const assertGetTasksCounterShard = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  assert(expected, "get tasks counter shard", () =>
    getTasksCounterShard(db, uid, projectId, shardId)
  );
};

export const assertCreateTasksCounterShard = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string,
  input: unknown
) => {
  assert(expected, `create tasks counter shard with input: ${input}`, () =>
    createTasksCounterShard(db, uid, projectId, shardId, input)
  );
};

export const assertUpdateTasksCounterShard = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string,
  input: unknown
) => {
  assert(expected, `update tasks counter shard with input: ${input}`, () =>
    updateTasksCounterShard(db, uid, projectId, shardId, input)
  );
};

export const assertDeleteTasksCounterShard = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  assert(expected, "delete tasks counter shard", () =>
    deleteTasksCounterShard(db, uid, projectId, shardId)
  );
};
