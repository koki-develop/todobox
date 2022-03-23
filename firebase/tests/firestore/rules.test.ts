import { assertSucceeds } from "@firebase/rules-unit-testing";
import { afterAll, it, describe, beforeEach } from "vitest";
import { createProject } from "../helpers/projects/db";
import {
  assertListProjects,
  assertGetProject,
  assertCreateProject,
  assertUpdateProject,
  assertDeleteProject,
} from "../helpers/projects/assertions";
import { createTasksCounterShard } from "../helpers/tasks/db";
import {
  assertListTasksCounterShards,
  assertGetTasksCounterShard,
  assertCreateTasksCounterShard,
  assertUpdateTasksCounterShard,
  assertDeleteTasksCounterShard,
} from "../helpers/tasks/assertions";
import { clearDb, getDb } from "../helpers/db";
import { cleanupTestEnvironment } from "../helpers/firebase";

beforeEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await cleanupTestEnvironment();
});

describe("Firestore Security Rules", () => {
  const dummyUid = "USER_ID";

  describe("projects", () => {
    describe("list", () => {
      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertListProjects("success", db, dummyUid);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertListProjects("fail", db, dummyUid);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertListProjects("fail", db, dummyUid);
      });
    });

    describe("get", () => {
      const dummyProjectId = "PROJECT_ID";

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetProject("success", db, dummyUid, dummyProjectId);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertGetProject("fail", db, dummyUid, dummyProjectId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
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
        const db = await getDb({ authenticateWith: dummyUid });

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
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        const input = validInputs[0];
        assertCreateProject("fail", db, dummyUid, dummyProjectId, input);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        const input = validInputs[0];
        assertCreateProject("fail", db, dummyUid, dummyProjectId, input);
      });
    });

    describe("update", () => {
      const dummyProjectId = "PROJECT_ID";
      const validInputs = [
        { name: "UPDATED_PROJECT_NAME" },
        { name: "  UPDATED_PROJECT_NAME  " },
        { name: "a".repeat(30) },
      ];
      const invalidInputs = [
        {},
        { name: 1 },
        { name: false },
        { name: ["UPDATED_PROJECT_NAME"] },
        { name: { name: "UPDATED_PROJECT_NAME" } },
        { unknownField: "VALUE" },
        { name: "UPDATED_PROJECT_NAME", unknownField: "VALUE" },
        { name: "" },
        { name: "  " },
        { name: "a".repeat(31) },
        { name: "a".repeat(50) },
      ];

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

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
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        const input = validInputs[0];
        assertUpdateProject("fail", db, dummyUid, dummyProjectId, input);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        const input = validInputs[0];
        assertUpdateProject("fail", db, dummyUid, dummyProjectId, input);
      });
    });

    describe("delete", () => {
      const dummyProjectId = "PROJECT_ID";

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertDeleteProject("success", db, dummyUid, dummyProjectId);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertDeleteProject("fail", db, dummyUid, dummyProjectId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertDeleteProject("fail", db, dummyUid, dummyProjectId);
      });
    });
  });

  describe("task counter shards", () => {
    const dummyProjectId = "PROJECT_ID";

    beforeEach(async () => {
      const db = await getDb({ authenticateWith: dummyUid });
      await assertSucceeds(
        createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
      );
    });

    describe("list", () => {
      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertListTasksCounterShards("success", db, dummyUid, dummyProjectId);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertListTasksCounterShards("fail", db, dummyUid, dummyProjectId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertListTasksCounterShards("fail", db, dummyUid, dummyProjectId);
      });
    });

    describe("get", () => {
      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetTasksCounterShard(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          "0"
        );
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetTasksCounterShard(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          "0"
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetTasksCounterShard(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          "0"
        );
      });
    });

    describe("create", () => {
      const validIds = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const invalidIds = ["SHARD_ID", "10", "11", "100"];
      const validInputs = [{ count: 0 }];
      const invalidInputs = [
        {},
        { unknownField: "VALUE" },
        { count: 1 },
        { count: -1 },
        { count: 0, unknownField: "VALUE" },
      ];

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

        describe("with valid id", () => {
          for (const id of validIds) {
            assertCreateTasksCounterShard(
              "success",
              db,
              dummyUid,
              dummyProjectId,
              id,
              validInputs[0]
            );
          }
        });

        describe("with invalid id", () => {
          for (const id of invalidIds) {
            assertCreateTasksCounterShard(
              "fail",
              db,
              dummyUid,
              dummyProjectId,
              id,
              validInputs[0]
            );
          }
        });

        describe("with valid input", () => {
          for (const input of validInputs) {
            assertCreateTasksCounterShard(
              "success",
              db,
              dummyUid,
              dummyProjectId,
              validIds[0],
              input
            );
          }
        });

        describe("with invalid input", () => {
          for (const input of invalidInputs) {
            assertCreateTasksCounterShard(
              "fail",
              db,
              dummyUid,
              dummyProjectId,
              validIds[0],
              input
            );
          }
        });
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertCreateTasksCounterShard(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          validIds[0],
          validInputs[0]
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertCreateTasksCounterShard(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          validIds[0],
          validInputs[0]
        );
      });
    });

    describe("update", () => {
      const dummyShardId = "0";
      const validInputs = [{ count: 1 }];
      const invalidInputs = [
        {},
        { unknownField: "VALUE" },
        { count: 1, unknownField: "VALUE" },
      ];

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createTasksCounterShard(db, dummyUid, dummyProjectId, dummyShardId, {
            count: 0,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

        describe("with valid input", () => {
          for (const input of validInputs) {
            assertUpdateTasksCounterShard(
              "success",
              db,
              dummyUid,
              dummyProjectId,
              dummyShardId,
              input
            );
          }
        });

        describe("with invalid input", () => {
          for (const input of invalidInputs) {
            assertUpdateTasksCounterShard(
              "fail",
              db,
              dummyUid,
              dummyProjectId,
              dummyShardId,
              input
            );
          }
        });
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertUpdateTasksCounterShard(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId,
          validInputs[0]
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertUpdateTasksCounterShard(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId,
          validInputs[0]
        );
      });
    });

    describe("delete", () => {
      const dummyShardId = "0";

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createTasksCounterShard(db, dummyUid, dummyProjectId, dummyShardId, {
            count: 0,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertDeleteTasksCounterShard(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId
        );
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertDeleteTasksCounterShard(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertDeleteTasksCounterShard(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId
        );
      });
    });
  });

  describe("sections", () => {
    const dummyProjectId = "PROJECT_ID";

    beforeEach(async () => {
      const db = await getDb({ authenticateWith: dummyUid });
      await assertSucceeds(
        createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
      );
    });

    describe("list", () => {
      describe("from myself", async () => {
        it.todo("pending");
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("get", () => {
      describe("from myself", async () => {
        it.todo("pending");
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("create", () => {
      describe("from myself", async () => {
        describe("with valid input", () => {
          it.todo("pending");
        });

        describe("with invalid input", () => {
          it.todo("pending");
        });
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("update", () => {
      describe("from myself", async () => {
        describe("with valid input", () => {
          it.todo("pending");
        });

        describe("with invalid input", () => {
          it.todo("pending");
        });
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("delete", () => {
      describe("from myself", async () => {
        it.todo("pending");
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });
  });

  describe("tasks", () => {
    const dummyProjectId = "PROJECT_ID";

    beforeEach(async () => {
      const db = await getDb({ authenticateWith: dummyUid });
      await assertSucceeds(
        createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
      );
    });

    describe("list", () => {
      describe("from myself", async () => {
        it.todo("pending");
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("get", () => {
      describe("from myself", async () => {
        it.todo("pending");
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("create", () => {
      describe("from myself", async () => {
        describe("with valid input", () => {
          it.todo("pending");
        });

        describe("with invalid input", () => {
          it.todo("pending");
        });
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("update", () => {
      describe("from myself", async () => {
        describe("with valid input", () => {
          it.todo("pending");
        });

        describe("with invalid input", () => {
          it.todo("pending");
        });
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });

    describe("delete", () => {
      describe("from myself", async () => {
        it.todo("pending");
      });

      describe("from another user", async () => {
        it.todo("pending");
      });

      describe("from unauthenticated user", async () => {
        it.todo("pending");
      });
    });
  });
});
