import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";
import { it, describe, expect, beforeEach } from "vitest";

const PROJECT_ID = "test-todo-box";

const getTestEnvironment = async () => {
  const firestoreRules = fs.readFileSync("firestore.rules", "utf8");

  return await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: firestoreRules,
    },
  });
};

const getAuthenticatedContext = async (uid: string) => {
  const testEnv = await getTestEnvironment();
  return testEnv.authenticatedContext(uid);
};

const getUnauthenticatedContext = async () => {
  const testEnv = await getTestEnvironment();
  return testEnv.unauthenticatedContext();
};

const getAuthenticatedFirestore = async (uid: string) => {
  const context = await getAuthenticatedContext(uid);
  return context.firestore();
};

const getUnauthenticatedFirestore = async () => {
  const context = await getUnauthenticatedContext();
  return context.firestore();
};

describe("/users/{userId}", () => {
  describe("/projects/{projectId}", () => {
    it.todo("pending");
  });

  describe("/counters/tasks/shards/{shardId}", () => {
    it.todo("pending");
  });

  describe("/sections/{sectionId}", () => {
    it.todo("pending");
  });

  describe("/tasks/{taskId}", () => {
    it.todo("pending");
  });
});
