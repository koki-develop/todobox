import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";
import firebase from "firebase/compat";
import { afterAll, it, describe, beforeEach } from "vitest";

const PROJECT_ID = "test-todo-box";

/*
 * helpers
 */

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

const listProjects = (db: firebase.firestore.Firestore, uid: string) => {
  const collectionRef = db.collection(`users/${uid}/projects`);
  return collectionRef.get();
};

const assertListProjects = (
  expected: "success" | "fail",
  db: firebase.firestore.Firestore,
  uid: string
) => {
  if (expected === "success") {
    it("should be able to list projects", async () => {
      await assertSucceeds(listProjects(db, uid));
    });
  } else {
    it("should not be able to list projects", async () => {
      await assertFails(listProjects(db, uid));
    });
  }
};

const getProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  const docRef = db.collection(`users/${uid}/projects`).doc(projectId);
  return docRef.get();
};

const assertGetProject = (
  expected: "success" | "fail",
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  if (expected === "success") {
    it("should be able to get project", async () => {
      await assertSucceeds(getProject(db, uid, projectId));
    });
  } else {
    it("should not be able to get project", async () => {
      await assertFails(getProject(db, uid, projectId));
    });
  }
};

const createProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  const docRef = db.collection(`users/${uid}/projects`).doc(projectId);
  return docRef.set(input);
};

const assertCreateProject = (
  expected: "success" | "fail",
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  if (expected === "success") {
    it(`should be able to create project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertSucceeds(createProject(db, uid, projectId, input));
    });
  } else {
    it(`should not be able to create project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertFails(createProject(db, uid, projectId, input));
    });
  }
};

const updateProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  const docRef = db.collection(`users/${uid}/projects`).doc(projectId);
  return docRef.update(input);
};

const assertUpdateProject = (
  expected: "success" | "fail",
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string,
  input: unknown
) => {
  if (expected === "success") {
    it(`should be able to update project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertSucceeds(updateProject(db, uid, projectId, input));
    });
  } else {
    it(`should not be able to update project with input: ${JSON.stringify(
      input
    )}`, async () => {
      await assertFails(updateProject(db, uid, projectId, input));
    });
  }
};

const deleteProject = (
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  const docRef = db.collection(`users/${uid}/projects`).doc(projectId);
  return docRef.delete();
};

const assertDeleteProject = (
  expected: "success" | "fail",
  db: firebase.firestore.Firestore,
  uid: string,
  projectId: string
) => {
  if (expected === "success") {
    it("should be able to delete project", async () => {
      await assertSucceeds(deleteProject(db, uid, projectId));
    });
  } else {
    it("should not be able to delete project", async () => {
      await assertFails(deleteProject(db, uid, projectId));
    });
  }
};

/*
 * tests
 */

beforeEach(async () => {
  const testEnv = await getTestEnvironment();
  await testEnv.clearFirestore();
});

afterAll(async () => {
  const testEnv = await getTestEnvironment();
  await testEnv.cleanup();
});

describe("Firestore Security Rules", () => {
  const dummyUid = "USER_ID";

  describe("projects", () => {
    describe("list", () => {
      describe("from myself", async () => {
        const db = await getAuthenticatedFirestore(dummyUid);
        assertListProjects("success", db, dummyUid);
      });

      describe("from another user", async () => {
        const db = await getAuthenticatedFirestore("ANOTHER_USER_ID");
        assertListProjects("fail", db, dummyUid);
      });

      describe("from unauthenticated user", async () => {
        const db = await getUnauthenticatedFirestore();
        assertListProjects("fail", db, dummyUid);
      });
    });

    describe("get", () => {
      const dummyProjectId = "PROJECT_ID";

      describe("from myself", async () => {
        const db = await getAuthenticatedFirestore(dummyUid);
        assertGetProject("success", db, dummyUid, dummyProjectId);
      });

      describe("from another user", async () => {
        const db = await getAuthenticatedFirestore("ANOTHER_USER_ID");
        assertGetProject("fail", db, dummyUid, dummyProjectId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getUnauthenticatedFirestore();
        assertGetProject("fail", db, dummyUid, dummyProjectId);
      });
    });

    describe("create", () => {
      const dummyProjectId = "PROJECT_ID";
      const validInputs = [
        { name: "PROJECT_NAME" },
        { name: "  PROJECT_NAME  " },
        { name: "a".repeat(30) },
      ];
      const invalidInputs = [
        {},
        { name: 1 },
        { name: false },
        { name: ["PROJECT_NAME"] },
        { name: { name: "PROJECT_NAME" } },
        { unknownField: "VALUE" },
        { name: "PROJECT_NAME", unknownField: "VALUE" },
        { name: "" },
        { name: "  " },
        { name: "a".repeat(31) },
        { name: "a".repeat(50) },
      ];

      describe("from myself", async () => {
        const db = await getAuthenticatedFirestore(dummyUid);
        describe("with valid input", async () => {
          for (const input of validInputs) {
            assertCreateProject("success", db, dummyUid, dummyProjectId, input);
          }
        });
        describe("witn invalid input", async () => {
          for (const input of invalidInputs) {
            assertCreateProject("fail", db, dummyUid, dummyProjectId, input);
          }
        });
      });

      describe("from another user", async () => {
        const db = await getAuthenticatedFirestore("ANOTHER_USER_ID");
        const input = validInputs[0];
        assertCreateProject("fail", db, dummyUid, dummyProjectId, input);
      });

      describe("from unauthenticated user", async () => {
        const db = await getUnauthenticatedFirestore();
        const input = validInputs[0];
        assertCreateProject("fail", db, dummyUid, dummyProjectId, input);
      });
    });

    describe("update", () => {
      const dummyProjectId = "PROJECT_ID";
      const validInputs = [{ name: "UPDATED_PROJECT" }];
      const invalidInputs = [{}];

      beforeEach(async () => {
        const db = await getAuthenticatedFirestore(dummyUid);
        await assertSucceeds(
          createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
        );
      });

      describe("from myself", async () => {
        const db = await getAuthenticatedFirestore(dummyUid);
        describe("with valid input", () => {
          for (const input of validInputs) {
            assertUpdateProject("success", db, dummyUid, dummyProjectId, input);
          }
        });
        describe("with invalid input", () => {
          for (const input of invalidInputs) {
            assertUpdateProject("fail", db, dummyUid, dummyProjectId, input);
          }
        });
      });

      describe("from another user", async () => {
        const db = await getAuthenticatedFirestore("ANOTHER_USER");
        const input = validInputs[0];
        assertUpdateProject("fail", db, dummyUid, dummyProjectId, input);
      });

      describe("from unauthenticated user", async () => {
        const db = await getUnauthenticatedFirestore();
        const input = validInputs[0];
        assertUpdateProject("fail", db, dummyUid, dummyProjectId, input);
      });
    });

    describe("delete", () => {
      const dummyProjectId = "PROJECT_ID";

      beforeEach(async () => {
        const db = await getAuthenticatedFirestore(dummyUid);
        await assertSucceeds(
          createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
        );
      });

      describe("from myself", async () => {
        const db = await getAuthenticatedFirestore(dummyUid);
        assertDeleteProject("success", db, dummyUid, dummyProjectId);
      });
      describe("from another user", async () => {
        const db = await getAuthenticatedFirestore("ANOTHER_USER_ID");
        assertDeleteProject("fail", db, dummyUid, dummyProjectId);
      });
      describe("from unauthenticated user", async () => {
        const db = await getUnauthenticatedFirestore();
        assertDeleteProject("fail", db, dummyUid, dummyProjectId);
      });
    });
  });

  describe("task counter shards", () => {
    describe("list", () => {
      it.todo("should be able to list own task counter shards");
      it.todo(
        "should not be able to list own task counter shards from another user"
      );
      it.todo(
        "should not be able to list own task counter shards from unauthenticated user"
      );
    });
    describe("get", () => {
      it.todo("should be able to get own task counter shard");
      it.todo(
        "should not be able to get own task counter shard from another user"
      );
      it.todo(
        "should not be able to get own task counter shard from unauthenticated user"
      );
    });
    describe("create", () => {
      it.todo(
        "should be able to create own task counter shard with valid input"
      );
      it.todo(
        "should not be able to create own task counter shard with invalid input"
      );
      it.todo(
        "should not be able to create own task counter shard from another user"
      );
      it.todo(
        "should not be able to create own task counter shard from unauthenticated user"
      );
    });
    describe("update", () => {
      it.todo(
        "should be able to update own task counter shard with valid input"
      );
      it.todo(
        "should not be able to update own task counter shard with invalid input"
      );
      it.todo(
        "should not be able to update own task counter shard from another user"
      );
      it.todo(
        "should not be able to update own task counter shard from unauthenticated user"
      );
    });
    describe("delete", () => {
      it.todo("should not be able to delete own task counter shard");
      it.todo(
        "should not be able to delete own task counter shard from another user"
      );
      it.todo(
        "should not be able to delete own task counter shard from unauthenticated user"
      );
    });
  });

  describe("sections", () => {
    describe("list", () => {
      it.todo("should be able to list own sections");
      it.todo("should not be able to list own sections from another user");
      it.todo(
        "should not be able to list own sections from unauthenticated user"
      );
    });
    describe("get", () => {
      it.todo("should be able to get own section");
      it.todo("should not be able to get own section from another user");
      it.todo(
        "should not be able to get own section from unauthenticated user"
      );
    });
    describe("create", () => {
      it.todo("should be able to create own section with valid input");
      it.todo("should not be able to create own section with invalid input");
      it.todo("should not be able to create own section from another user");
      it.todo(
        "should not be able to create own section from unauthenticated user"
      );
    });
    describe("update", () => {
      it.todo("should be able to update own section with valid input");
      it.todo("should not be able to update own section with invalid input");
      it.todo("should not be able to update own section from another user");
      it.todo(
        "should not be able to update own section from unauthenticated user"
      );
    });
    describe("delete", () => {
      it.todo("should be able to delete own section");
      it.todo("should not be able to delete own section from another user");
      it.todo(
        "should not be able to delete own section from unauthenticated user"
      );
    });
  });

  describe("tasks", () => {
    describe("list", () => {
      it.todo("should be able to list own tasks");
      it.todo("should not be able to list own tasks from another user");
      it.todo("should not be able to list own tasks from unauthenticated user");
    });
    describe("get", () => {
      it.todo("should be able to get own task");
      it.todo("should not be able to get own task from another user");
      it.todo("should not be able to get own task from unauthenticated user");
    });
    describe("create", () => {
      it.todo("should be able to create own task with valid input");
      it.todo("should not be able to create own task with invalid input");
      it.todo("should not be able to create own task from another user");
      it.todo(
        "should not be able to create own task from unauthenticated user"
      );
    });
    describe("update", () => {
      it.todo("should be able to update own task with valid input");
      it.todo("should not be able to update own task with invalid input");
      it.todo("should not be able to update own task from another user");
      it.todo(
        "should not be able to update own task from unauthenticated user"
      );
    });
    describe("delete", () => {
      it.todo("should be able to delete own task");
      it.todo("should not be able to delete own task from another user");
      it.todo(
        "should not be able to delete own task from unauthenticated user"
      );
    });
  });
});

// describe("/users/{userId}", () => {
//   const uid = "USER_ID";
//   const anotherUid = "ANOTHER_USER_ID";

//   describe("/projects/{projectId}", () => {
//     const projectId = "PROJECT_ID";
//     const projectsCollectionPath = `users/${uid}/projects`;

//     it.todo("should be able to access to own projects", async () => {
//       const db = await getAuthenticatedFirestore(uid);
//       const collectionRef = db.collection(projectsCollectionPath);
//       const docRef = collectionRef.doc(projectId);
//       // list
//       await assertSucceeds(collectionRef.get());
//       // get
//       await assertSucceeds(docRef.get());
//       // create
//       await assertFails(docRef.set({}));
//       await assertFails(
//         docRef.set({ name: "PROJECT_NAME", unknownField: "VALUE" })
//       );
//       await assertFails(docRef.set({ name: 1 }));
//       await assertFails(docRef.set({ name: "" }));
//       await assertFails(docRef.set({ name: "  " }));
//       await assertFails(docRef.set({ name: "a".repeat(31) }));
//       await assertFails(docRef.set({ name: "a".repeat(50) }));
//       await assertSucceeds(docRef.set({ name: "a".repeat(30) }));
//       await assertSucceeds(docRef.set({ name: "PROJECT_NAME" }));
//       // update
//       await assertFails(docRef.update({}));
//       await assertFails(
//         docRef.update({ name: "UPDATED_PROJECT_NAME", unknownField: "VALUE" })
//       );
//       await assertFails(docRef.update({ name: 1 }));
//       await assertFails(docRef.update({ name: "a".repeat(31) }));
//       await assertFails(docRef.update({ name: "a".repeat(50) }));
//       await assertSucceeds(docRef.update({ name: "a".repeat(30) }));
//       await assertSucceeds(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
//       // delete
//       await assertSucceeds(docRef.delete());
//     });

//     it.todo(
//       "should not be able to access to own projects from another user",
//       async () => {
//         const db = await getAuthenticatedFirestore(anotherUid);
//         const collectionRef = db.collection(projectsCollectionPath);
//         const docRef = collectionRef.doc(projectId);
//         // list
//         await assertFails(collectionRef.get());
//         // get
//         await assertFails(docRef.get());
//         // create
//         await assertFails(docRef.set({ name: "PROJECT_NAME" }));
//         // update
//         await assertFails(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
//         // delete
//         await assertFails(docRef.delete());
//       }
//     );

//     it.todo(
//       "should not be able to access to own projects from unauthenticated user",
//       async () => {
//         const db = await getUnauthenticatedFirestore();
//         const collectionRef = db.collection(projectsCollectionPath);
//         const docRef = collectionRef.doc(projectId);
//         // list
//         await assertFails(collectionRef.get());
//         // get
//         await assertFails(docRef.get());
//         // create
//         await assertFails(docRef.set({ name: "PROJECT_NAME" }));
//         // update
//         await assertFails(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
//         // delete
//         await assertFails(docRef.delete());
//       }
//     );

//     describe("/counters/tasks/shards/{shardId}", () => {
//       const shardsCollectionPath = path.join(
//         projectsCollectionPath,
//         projectId,
//         "counters/tasks/shards"
//       );
//       const sharedId = "1";

//       it.todo("should be able to access to own counter shards", async () => {
//         const db = await getAuthenticatedFirestore(uid);
//         const collectionRef = db.collection(shardsCollectionPath);
//         const docRef = collectionRef.doc(sharedId);
//         // list
//         await assertSucceeds(collectionRef.get());
//         // get
//         await assertSucceeds(docRef.get());
//         // create
//         await assertFails(collectionRef.doc("INVALID_ID").set({ count: 0 }));
//         await assertFails(collectionRef.doc("-1").set({ count: 0 }));
//         await assertFails(collectionRef.doc("10").set({ count: 0 }));
//         await assertFails(docRef.set({ count: 1 }));
//         await assertFails(docRef.set({ count: -1 }));
//         await assertFails(docRef.set({ count: "COUNT" }));
//         await assertSucceeds(docRef.set({ count: 0 }));
//         // update
//         await assertFails(docRef.update({ count: "COUNT" }));
//         await assertSucceeds(docRef.update({ count: 1 }));
//         await assertSucceeds(docRef.update({ count: -1 }));
//         // delete
//         await assertFails(docRef.delete());
//       });
//       it.todo(
//         "should not be able to access to own counter shards from another user",
//         async () => {
//           const db = await getAuthenticatedFirestore(anotherUid);
//           const collectionRef = db.collection(shardsCollectionPath);
//           const docRef = collectionRef.doc(sharedId);
//           // list
//           await assertFails(collectionRef.get());
//           // get
//           await assertFails(docRef.get());
//           // create
//           await assertFails(docRef.set({ count: 0 }));
//           // update
//           await assertFails(docRef.update({ count: 1 }));
//           // delete
//           await assertFails(docRef.delete());
//         }
//       );
//       it.todo(
//         "should not be able to access to own counter shards from unauthenticated user",
//         async () => {
//           const db = await getUnauthenticatedFirestore();
//           const collectionRef = db.collection(shardsCollectionPath);
//           const docRef = collectionRef.doc(sharedId);
//           // list
//           await assertFails(collectionRef.get());
//           // get
//           await assertFails(docRef.get());
//           // create
//           await assertFails(docRef.set({ count: 0 }));
//           // update
//           await assertFails(docRef.update({ count: 1 }));
//           // delete
//           await assertFails(docRef.delete());
//         }
//       );
//     });

//     describe("/sections/{sectionId}", () => {
//       const sectionsCollectionPath = path.join(
//         projectsCollectionPath,
//         projectId,
//         "sections"
//       );
//       const sectionId = "SECTION_ID";

//       it.todo("should be able to access to own sections", async () => {
//         const db = await getAuthenticatedFirestore(uid);
//         const collectionRef = db.collection(sectionsCollectionPath);
//         const docRef = collectionRef.doc(sectionId);
//         // list
//         await assertSucceeds(collectionRef.get());
//         // get
//         await assertSucceeds(docRef.get());
//         // create
//         await assertFails(
//           docRef.set({ name: "SECTION_NAME", index: 0, unknownField: "VALUE" })
//         );
//         await assertFails(docRef.set({ name: "SECTION_NAME" }));
//         await assertFails(docRef.set({ name: 0, index: 0 }));
//         await assertFails(docRef.set({ name: "", index: 0 }));
//         await assertFails(docRef.set({ name: "  ", index: 0 }));
//         await assertFails(docRef.set({ name: "a".repeat(256), index: 0 }));
//         await assertFails(docRef.set({ name: "a".repeat(500), index: 0 }));
//         await assertFails(docRef.set({ index: 0 }));
//         await assertFails(docRef.set({ name: "SECTION_NAME", index: "INDEX" }));
//         await assertFails(docRef.set({ name: "SECTION_NAME", index: -1 }));
//         await assertSucceeds(docRef.set({ name: "a".repeat(255), index: 0 }));
//         await assertSucceeds(docRef.set({ name: "SECTION_NAME", index: 0 }));
//         // update
//         await assertFails(docRef.update({}));
//         await assertFails(
//           docRef.update({
//             name: "UPDATED_SECTION_NAME",
//             index: 1,
//             unknownField: "VALUE",
//           })
//         );
//         await assertSucceeds(docRef.update({ name: "UPDATED_SECTION_NAME" }));
//         await assertSucceeds(docRef.update({ index: 1 }));
//         await assertSucceeds(
//           docRef.update({ name: "RE_UPDATED_SECTION_NAME", index: 2 })
//         );
//         // delete
//         await assertSucceeds(docRef.delete());
//       });
//       it.todo(
//         "should not be able to access to own sections from another user",
//         async () => {
//           const db = await getAuthenticatedFirestore(anotherUid);
//           const collectionRef = db.collection(sectionsCollectionPath);
//           const docRef = collectionRef.doc(sectionId);
//           // list
//           await assertFails(collectionRef.get());
//           // get
//           await assertFails(docRef.get());
//           // create
//           await assertFails(docRef.set({ name: "a".repeat(255), index: 0 }));
//           // update
//           await assertFails(
//             docRef.update({ name: "UPDATED_SECTION_NAME", index: 1 })
//           );
//           // delete
//           await assertFails(docRef.delete());
//         }
//       );
//       it.todo(
//         "should not be able to access to own sections from unauthenticated user",
//         async () => {
//           const db = await getUnauthenticatedFirestore();
//           const collectionRef = db.collection(sectionsCollectionPath);
//           const docRef = collectionRef.doc(sectionId);
//           // list
//           await assertFails(collectionRef.get());
//           // get
//           await assertFails(docRef.get());
//           // create
//           await assertFails(docRef.set({ name: "a".repeat(255), index: 0 }));
//           // update
//           await assertFails(
//             docRef.update({ name: "UPDATED_SECTION_NAME", index: 1 })
//           );
//           // delete
//           await assertFails(docRef.delete());
//         }
//       );
//     });

//     describe("/tasks/{taskId}", () => {
//       const tasksCollectionPath = path.join(
//         projectsCollectionPath,
//         projectId,
//         "tasks"
//       );
//       const taskId = "TASK_ID";
//       const sectionId = "SECTION_ID";

//       beforeEach(async () => {
//         const db = await getAuthenticatedFirestore(uid);
//         const sectionsCollectionPath = path.join(
//           projectsCollectionPath,
//           projectId,
//           "sections"
//         );
//         await assertSucceeds(
//           db
//             .collection(sectionsCollectionPath)
//             .doc(sectionId)
//             .set({ name: "SECTION_NAME", index: 0 })
//         );
//       });

//       it.todo("should be able to access to own tasks", async () => {
//         const db = await getAuthenticatedFirestore(uid);
//         const collectionRef = db.collection(tasksCollectionPath);
//         const docRef = collectionRef.doc(taskId);
//         // list
//         await assertSucceeds(collectionRef.get());
//         // get
//         await assertSucceeds(docRef.get());
//         // create
//         await assertFails(
//           docRef.set({
//             sectionId: "NOT_EXISTS_SECTION_ID",
//             index: 0,
//             title: "TASK_TITLE",
//             description: "TASK_DESCRIPTION",
//             completedAt: null,
//           })
//         );
//         await assertSucceeds(
//           docRef.set({
//             sectionId: sectionId,
//             index: 0,
//             title: "TASK_TITLE",
//             description: "TASK_DESCRIPTION",
//             completedAt: null,
//           })
//         );
//         await assertSucceeds(
//           docRef.set({
//             sectionId: null,
//             index: 0,
//             title: "TASK_TITLE",
//             description: "TASK_DESCRIPTION",
//             completedAt: null,
//           })
//         );
//         // update
//         await assertSucceeds(
//           docRef.update({
//             sectionId: null,
//             index: 1,
//             title: "UPDATED_TASK_TITLE",
//             description: "UPDATED_TASK_DESCRIPTION",
//             completedAt: new Date(),
//           })
//         );
//         // delete
//         await assertSucceeds(docRef.delete());
//       });
//       it.todo(
//         "should not be able to access to own tasks from another user",
//         async () => {
//           const db = await getAuthenticatedFirestore(anotherUid);
//           const collectionRef = db.collection(tasksCollectionPath);
//           const docRef = collectionRef.doc(taskId);
//           // list
//           await assertFails(collectionRef.get());
//           // get
//           await assertFails(docRef.get());
//           // create
//           await assertFails(
//             docRef.set({
//               sectionId: null,
//               index: 0,
//               title: "TASK_TITLE",
//               description: "TASK_DESCRIPTION",
//               completedAt: null,
//             })
//           );
//           // update
//           await assertFails(
//             docRef.update({
//               sectionId: null,
//               index: 1,
//               title: "UPDATED_TASK_TITLE",
//               description: "UPDATED_TASK_DESCRIPTION",
//               completedAt: new Date(),
//             })
//           );
//           // delete
//           await assertFails(docRef.delete());
//         }
//       );
//       it.todo(
//         "should not be able to access to own tasks from unauthenticated user",
//         async () => {
//           const db = await getAuthenticatedFirestore(anotherUid);
//           const collectionRef = db.collection(tasksCollectionPath);
//           const docRef = collectionRef.doc(taskId);
//           // list
//           await assertFails(collectionRef.get());
//           // get
//           await assertFails(docRef.get());
//           // create
//           await assertFails(
//             docRef.set({
//               sectionId: null,
//               index: 0,
//               title: "TASK_TITLE",
//               description: "TASK_DESCRIPTION",
//               completedAt: null,
//             })
//           );
//           // update
//           await assertFails(
//             docRef.update({
//               sectionId: null,
//               index: 1,
//               title: "UPDATED_TASK_TITLE",
//               description: "UPDATED_TASK_DESCRIPTION",
//               completedAt: new Date(),
//             })
//           );
//           // delete
//           await assertFails(docRef.delete());
//         }
//       );
//     });
//   });
// });
