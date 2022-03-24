import firebase from "firebase/compat";
import { assertAction, AssertResult } from "../assertions";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  listTasksCounterShards,
  getTasksCounterShard,
  createTasksCounterShard,
  updateTasksCounterShard,
  deleteTasksCounterShard,
} from "./db";

export const assertListTasks = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assertAction(expected, "list tasks", () => listTasks(db, uid, projectId));
};

export const assertGetTask = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  taskId: string
) => {
  assertAction(expected, "get task", () => getTask(db, uid, projectId, taskId));
};

export const assertCreateTask = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  taskId: string,
  input: unknown
) => {
  assertAction(
    expected,
    `create task with input: ${JSON.stringify(input)}`,
    () => createTask(db, uid, projectId, taskId, input)
  );
};

export const assertUpdateTask = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  taskId: string,
  input: unknown
) => {
  assertAction(
    expected,
    `update task with input: ${JSON.stringify(input)}`,
    () => updateTask(db, uid, projectId, taskId, input)
  );
};

export const assertDeleteTask = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  taskId: string
) => {
  assertAction(expected, "delete task", () =>
    deleteTask(db, uid, projectId, taskId)
  );
};

export const assertListTasksCounterShards = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  assertAction(expected, "list tasks counter shards", () =>
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
  assertAction(expected, "get tasks counter shard", () =>
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
  assertAction(
    expected,
    `create tasks counter shard with id: ${shardId}, input: ${JSON.stringify(
      input
    )}`,
    () => createTasksCounterShard(db, uid, projectId, shardId, input)
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
  assertAction(
    expected,
    `update tasks counter shard with input: ${JSON.stringify(input)}`,
    () => updateTasksCounterShard(db, uid, projectId, shardId, input)
  );
};

export const assertDeleteTasksCounterShard = (
  expected: AssertResult,
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  shardId: string
) => {
  assertAction(expected, "delete tasks counter shard", () =>
    deleteTasksCounterShard(db, uid, projectId, shardId)
  );
};
