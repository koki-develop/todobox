import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import fs from "fs";
import { it, describe, beforeEach } from "vitest";

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

beforeEach(async () => {
  const testEnv = await getTestEnvironment();
  await testEnv.clearFirestore();
});

describe("/users/{userId}/projects/{projectId}", () => {
  describe("authenticated", async () => {
    const uid = "USER_ID";
    const collectionPath = `users/${uid}/projects`;

    it("should be able to to read own projects", async () => {
      const db = await getAuthenticatedFirestore(uid);
      await assertSucceeds(db.collection(collectionPath).get());
      await assertSucceeds(
        db.collection(collectionPath).doc("PROJECT_ID").get()
      );
    });
    it("should not be able to read own projects from another user", async () => {
      const anotherUid = "ANOTHER_USER_ID";
      const db = await getAuthenticatedFirestore(anotherUid);
      await assertFails(db.collection(collectionPath).get());
      await assertFails(db.collection(collectionPath).doc("PROJECT_ID").get());
    });
  });
});

describe("/users/{userId}/counters/tasks/shards/{shardId}", () => {
  it.todo("pending");
});

describe("/users/{userId}/sections/{sectionId}", () => {
  it.todo("pending");
});

describe("/users/{userId}/tasks/{taskId}", () => {
  it.todo("pending");
});
