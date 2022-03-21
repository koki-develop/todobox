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
    const projectId = "PROJECT_ID";

    it("should be able to access to own project", async () => {
      const db = await getAuthenticatedFirestore(uid);
      const collectionRef = db.collection(collectionPath);
      const docRef = collectionRef.doc(projectId);
      // list
      await assertSucceeds(collectionRef.get());
      // get
      await assertSucceeds(docRef.get());
      // create
      await assertFails(docRef.set({}));
      await assertFails(docRef.set({ name: 1 }));
      await assertSucceeds(docRef.set({ name: "PROJECT_NAME" }));
      // update
      await assertSucceeds(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
      // delete
      await assertSucceeds(docRef.delete());
    });
    it("should not be able to access to own projects from another user", async () => {
      const anotherUid = "ANOTHER_USER_ID";
      const db = await getAuthenticatedFirestore(anotherUid);
      const collectionRef = db.collection(collectionPath);
      const docRef = collectionRef.doc(projectId);
      // list
      await assertFails(collectionRef.get());
      // get
      await assertFails(docRef.get());
      // create
      await assertFails(docRef.set({ name: "PROJECT_NAME" }));
      // update
      await assertFails(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
      // delete
      await assertFails(docRef.delete());
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
