import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";
import { afterAll, it, describe, beforeEach } from "vitest";

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

afterAll(async () => {
  const testEnv = await getTestEnvironment();
  await testEnv.cleanup();
});

describe("/users/{userId}", () => {
  const uid = "USER_ID";
  const anotherUid = "ANOTHER_USER_ID";

  describe("/projects/{projectId}", () => {
    const projectId = "PROJECT_ID";
    const projectsCollectionPath = `users/${uid}/projects`;

    it("should be able to access to own projects", async () => {
      const db = await getAuthenticatedFirestore(uid);
      const collectionRef = db.collection(projectsCollectionPath);
      const docRef = collectionRef.doc(projectId);
      // list
      await assertSucceeds(collectionRef.get());
      // get
      await assertSucceeds(docRef.get());
      // create
      await assertFails(docRef.set({}));
      await assertFails(docRef.set({ unknownField: "VALUE" }));
      await assertFails(docRef.set({ name: 1 }));
      await assertSucceeds(docRef.set({ name: "PROJECT_NAME" }));
      // update
      await assertFails(docRef.update({}));
      await assertFails(docRef.update({ unknownField: "VALUE" }));
      await assertFails(docRef.update({ name: 1 }));
      await assertSucceeds(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
      // delete
      await assertSucceeds(docRef.delete());
    });

    it("should not be able to access to own projects from another user", async () => {
      const db = await getAuthenticatedFirestore(anotherUid);
      const collectionRef = db.collection(projectsCollectionPath);
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

    it("should not be able to access to own projects from unauthenticated user", async () => {
      const db = await getUnauthenticatedFirestore();
      const collectionRef = db.collection(projectsCollectionPath);
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

    describe("/counters/tasks/shards/{shardId}", () => {
      const shardsCollectionPath = path.join(
        projectsCollectionPath,
        projectId,
        "counters/tasks/shards"
      );
      const sharedId = "1";

      it("should be able to access to own counter shards", async () => {
        const db = await getAuthenticatedFirestore(uid);
        const collectionRef = db.collection(shardsCollectionPath);
        const docRef = collectionRef.doc(sharedId);
        // list
        await assertSucceeds(collectionRef.get());
        // get
        await assertSucceeds(docRef.get());
        // create
        await assertFails(collectionRef.doc("INVALID_ID").set({ count: 0 }));
        await assertFails(collectionRef.doc("-1").set({ count: 0 }));
        await assertFails(collectionRef.doc("10").set({ count: 0 }));
        await assertFails(docRef.set({ count: 1 }));
        await assertFails(docRef.set({ count: -1 }));
        await assertFails(docRef.set({ count: "COUNT" }));
        await assertSucceeds(docRef.set({ count: 0 }));
        // update
        await assertFails(docRef.update({ count: "COUNT" }));
        await assertSucceeds(docRef.update({ count: 1 }));
        await assertSucceeds(docRef.update({ count: -1 }));
        // delete
        await assertFails(docRef.delete());
      });
    });

    describe("/sections/{sectionId}", () => {
      it.todo("pending");
    });

    describe("/tasks/{taskId}", () => {
      it.todo("pending");
    });
  });
});
