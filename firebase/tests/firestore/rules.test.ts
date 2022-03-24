import { assertSucceeds } from "@firebase/rules-unit-testing";
import { afterAll, describe, beforeEach } from "vitest";
import { ulid } from "ulid";
import { createProject } from "../helpers/projects/db";
import {
  assertListProjects,
  assertGetProject,
  assertCreateProject,
  assertUpdateProject,
  assertDeleteProject,
} from "../helpers/projects/assertions";
import { createSection } from "../helpers/sections/db";
import {
  assertListSections,
  assertGetSection,
  assertCreateSection,
  assertUpdateSection,
  assertDeleteSection,
} from "../helpers/sections/assertions";
import { createTask, createTasksCounterShard } from "../helpers/tasks/db";
import {
  assertListTasks,
  assertGetTask,
  assertCreateTask,
  assertUpdateTask,
  assertDeleteTask,
  assertListTasksCounterShards,
  assertGetTasksCounterShard,
  assertCreateTasksCounterShard,
  assertUpdateTasksCounterShard,
  assertDeleteTasksCounterShard,
} from "../helpers/tasks/assertions";
import { clearDb, getDb } from "../helpers/db";
import { cleanupTestEnvironment } from "../helpers/firebase";
import { deleteKeys } from "../helpers/utils";

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
      const dummyProjectId = ulid();

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
        );
      });

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
      const validIds = [ulid(), ulid(), ulid()];
      const invalidIds = ["INVALID_ID", "1", "aaa"];
      const validInputs = [
        { name: "PROJECT_NAME" },
        { name: "  PROJECT_NAME  " },
        { name: "a".repeat(30) },
      ];
      const invalidInputs = [
        // フィールドが足りないパターン
        {},
        // 型が正しくないパターン
        { name: 1 },
        { name: false },
        { name: ["PROJECT_NAME"] },
        { name: { name: "PROJECT_NAME" } },
        // 余計なフィールドがあるパターン
        { unknownField: "VALUE" },
        { name: "PROJECT_NAME", unknownField: "VALUE" },
        // 値が無効なパターン
        { name: "" },
        { name: "  " },
        { name: "a".repeat(31) },
        { name: "a".repeat(50) },
      ];

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

        describe("with valid id", async () => {
          for (const id of validIds) {
            assertCreateProject("success", db, dummyUid, id, validInputs[0]);
          }
        });

        describe("with invalid id", async () => {
          for (const id of invalidIds) {
            assertCreateProject("fail", db, dummyUid, id, validInputs[0]);
          }
        });

        describe("with valid input", async () => {
          for (const input of validInputs) {
            assertCreateProject("success", db, dummyUid, validIds[0], input);
          }
        });

        describe("witn invalid input", async () => {
          for (const input of invalidInputs) {
            assertCreateProject("fail", db, dummyUid, validIds[0], input);
          }
        });
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        const input = validInputs[0];
        assertCreateProject("fail", db, dummyUid, validIds[0], input);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        const input = validInputs[0];
        assertCreateProject("fail", db, dummyUid, validIds[0], input);
      });
    });

    describe("update", () => {
      const dummyProjectId = ulid();
      const validInputs = [
        { name: "UPDATED_PROJECT_NAME" },
        { name: "  UPDATED_PROJECT_NAME  " },
        { name: "a".repeat(30) },
      ];
      const invalidInputs = [
        // 型が正しくないパターン
        { name: 1 },
        { name: false },
        { name: ["UPDATED_PROJECT_NAME"] },
        { name: { name: "UPDATED_PROJECT_NAME" } },
        // 余計なフィールドがあるパターン
        { unknownField: "VALUE" },
        { name: "UPDATED_PROJECT", unknownField: "VALUE" },
        // 値が無効なパターン
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

        describe("when project does not exists", () => {
          assertUpdateProject("fail", db, dummyUid, ulid(), validInputs[0]);
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
      const dummyProjectId = ulid();

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
    const dummyProjectId = ulid();

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
        assertGetTasksCounterShard(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId
        );
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetTasksCounterShard(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetTasksCounterShard(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          dummyShardId
        );
      });
    });

    describe("create", () => {
      const validIds = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const invalidIds = ["SHARD_ID", "10", "11", "100"];
      const validInputs = [{ count: 0 }];
      const invalidInputs = [
        // フィールドが足りないパターン
        {},
        // 型が正しくないパターン
        { count: "0" },
        { count: false },
        { count: [0] },
        { count: { count: 0 } },
        // 余計なフィールドがあるパターン
        { unknownField: "VALUE" },
        { count: 0, unknownField: "VALUE" },
        // 値が無効なパターン
        { count: 1 },
        { count: 10 },
        { count: -1 },
        { count: -10 },
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

        describe("when project does not exists", () => {
          assertCreateTasksCounterShard(
            "fail",
            db,
            dummyUid,
            ulid(),
            validIds[0],
            validInputs[0]
          );
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
        // 型が正しくないパターン
        { count: "0" },
        { count: false },
        { count: [1] },
        { count: { count: 1 } },
        // 余計なフィールドがあるパターン
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
    const dummyProjectId = ulid();

    beforeEach(async () => {
      const db = await getDb({ authenticateWith: dummyUid });
      await assertSucceeds(
        createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
      );
    });

    describe("list", () => {
      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertListSections("success", db, dummyUid, dummyProjectId);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertListSections("fail", db, dummyUid, dummyProjectId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertListSections("fail", db, dummyUid, dummyProjectId);
      });
    });

    describe("get", () => {
      const dummySectionId = "SECTION_ID";

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createSection(db, dummyUid, dummyProjectId, dummySectionId, {
            name: "SECTION_NAME",
            index: 0,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetSection(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId
        );
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertGetSection("fail", db, dummyUid, dummyProjectId, dummySectionId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertGetSection("fail", db, dummyUid, dummyProjectId, dummySectionId);
      });
    });

    describe("create", () => {
      const dummySectionId = "SECTION_ID";
      const validInputs = [
        { name: "SECTION_NAME", index: 0 },
        { name: "SECTION_NAME", index: 1 },
        { name: "SECTION_NAME", index: 10 },
        { name: "a".repeat(255), index: 0 },
      ];
      const invalidInputs = [
        // フィールドが足りないパターン
        {},
        { name: "SECTION_NAME" },
        { index: 0 },
        // 型が正しくないパターン
        { name: 1, index: 0 },
        { name: false, index: 0 },
        { name: ["SECTION_NAME"], index: 0 },
        { name: { name: "SECTION_NAME" }, index: 0 },
        { name: "SECTION_NAME", index: "0" },
        { name: "SECTION_NAME", index: false },
        { name: "SECTION_NAME", index: [0] },
        { name: "SECTION_NAME", index: { index: 0 } },
        // 余計なフィールドがあるパターン
        { unknownField: "VALUE" },
        { index: 0, unknownField: "VALUE" },
        { name: "SECTION_NAME", unknownField: "VALUE" },
        { name: "SECTION_NAME", index: 0, unknownField: "VALUE" },
        // 値が無効なパターン
        { name: "", index: 0 },
        { name: "  ", index: 0 },
        { name: "a".repeat(256), index: 0 },
        { name: "a".repeat(500), index: 0 },
        { name: "SECTION_NAME", index: -1 },
        { name: "SECTION_NAME", index: -2 },
        { name: "SECTION_NAME", index: -10 },
      ];

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

        describe("with valid input", () => {
          for (const input of validInputs) {
            assertCreateSection(
              "success",
              db,
              dummyUid,
              dummyProjectId,
              dummySectionId,
              input
            );
          }
        });

        describe("with invalid input", () => {
          for (const input of invalidInputs) {
            assertCreateSection(
              "fail",
              db,
              dummyUid,
              dummyProjectId,
              dummySectionId,
              input
            );
          }
        });
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertCreateSection(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId,
          validInputs[0]
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertCreateSection(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId,
          validInputs[0]
        );
      });
    });

    describe("update", () => {
      const dummySectionId = "SECTION_ID";
      const validInputs = [
        { name: "UPDATED_SECTION_NAME", index: 1 },
        { name: "UPDATED_SECTION_NAME" },
        { name: "a".repeat(255) },
        { index: 1 },
        { index: 10 },
      ];
      const invalidInputs = [
        // 型が正しくないパターン
        { name: 1, index: 1 },
        { name: false, index: 1 },
        { name: ["UPDATED_SECTION_NAME"], index: 1 },
        { name: { name: "UPDATED_SECTION_NAME" }, index: 1 },
        { name: "UPDATED_SECTION_NAME", index: "1" },
        { name: "UPDATED_SECTION_NAME", index: false },
        { name: "UPDATED_SECTION_NAME", index: [1] },
        { name: "UPDATED_SECTION_NAME", index: { index: 1 } },
        // 余計なフィールドがあるパターン
        { unknownField: "VALUE" },
        { index: 1, unknownField: "VALUE" },
        { name: "UPDATED_SECTION_NAME", unknownField: "VALUE" },
        { name: "UPDATED_SECTION_NAME", index: 1, unknownField: "VALUE" },
        // 値が無効なパターン
        { name: "", index: 1 },
        { name: "  ", index: 1 },
        { name: "a".repeat(256), index: 1 },
        { name: "a".repeat(500), index: 1 },
        { name: "UPDATED_SECTION_NAME", index: -1 },
        { name: "UPDATED_SECTION_NAME", index: -2 },
        { name: "UPDATED_SECTION_NAME", index: -10 },
      ];

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createSection(db, dummyUid, dummyProjectId, dummySectionId, {
            name: "SECTION_NAME",
            index: 0,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

        describe("with valid input", () => {
          for (const input of validInputs) {
            assertUpdateSection(
              "success",
              db,
              dummyUid,
              dummyProjectId,
              dummySectionId,
              input
            );
          }
        });

        describe("with invalid input", () => {
          for (const input of invalidInputs) {
            assertUpdateSection(
              "fail",
              db,
              dummyUid,
              dummyProjectId,
              dummySectionId,
              input
            );
          }
        });
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertUpdateSection(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId,
          validInputs[0]
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertUpdateSection(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId,
          validInputs[0]
        );
      });
    });

    describe("delete", () => {
      const dummySectionId = "SECTION_ID";

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertDeleteSection(
          "success",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId
        );
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertDeleteSection(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertDeleteSection(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummySectionId
        );
      });
    });
  });

  describe("tasks", () => {
    const dummyProjectId = ulid();

    beforeEach(async () => {
      const db = await getDb({ authenticateWith: dummyUid });
      await assertSucceeds(
        createProject(db, dummyUid, dummyProjectId, { name: "PROJECT_NAME" })
      );
    });

    describe("list", () => {
      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertListTasks("success", db, dummyUid, dummyProjectId);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertListTasks("fail", db, dummyUid, dummyProjectId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertListTasks("fail", db, dummyUid, dummyProjectId);
      });
    });

    describe("get", () => {
      const dummyTaskId = "TASK_ID";

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createTask(db, dummyUid, dummyProjectId, dummyTaskId, {
            title: "TASK_TITLE",
            sectionId: null,
            description: "TASK_DESCRIPTION",
            index: 0,
            completedAt: null,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertGetTask("success", db, dummyUid, dummyProjectId, dummyTaskId);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertGetTask("fail", db, dummyUid, dummyProjectId, dummyTaskId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertGetTask("fail", db, dummyUid, dummyProjectId, dummyTaskId);
      });
    });

    describe("create", () => {
      const dummyTaskId = "TASK_ID";
      const dummySectionId = "SECTION_ID";
      // TODO: テストケース追加
      const validInputBase = {
        title: "TASK_TITLE",
        sectionId: null,
        description: "TASK_DESCRIPTION",
        index: 0,
        completedAt: null,
      };
      const validInputs = [
        { ...validInputBase },
        { ...validInputBase, sectionId: dummySectionId },
        { ...validInputBase, index: 1 },
        { ...validInputBase, index: 10 },
      ];
      const invalidInputs = [
        // フィールドが足りないパターン
        {},
        deleteKeys(validInputBase, "title"),
        deleteKeys(validInputBase, "sectionId"),
        deleteKeys(validInputBase, "description"),
        deleteKeys(validInputBase, "index"),
        deleteKeys(validInputBase, "completedAt"),
        // 型が正しくないパターン
        { ...validInputBase, title: 1 },
        { ...validInputBase, title: false },
        { ...validInputBase, title: ["TASK_TITLE"] },
        { ...validInputBase, title: { title: "TASK_TITLE" } },
        { ...validInputBase, sectionId: 1 },
        { ...validInputBase, sectionId: false },
        { ...validInputBase, sectionId: [dummySectionId] },
        { ...validInputBase, sectionId: { sectionId: dummySectionId } },
        { ...validInputBase, description: 1 },
        { ...validInputBase, description: false },
        { ...validInputBase, description: ["TASK_DESCRIPTION"] },
        { ...validInputBase, description: { description: "TASK_DESCRIPTION" } },
        { ...validInputBase, index: "0" },
        { ...validInputBase, index: false },
        { ...validInputBase, index: [0] },
        { ...validInputBase, index: { index: 0 } },
        { ...validInputBase, completedAt: "COMPLETED_AT" },
        { ...validInputBase, completedAt: 0 },
        { ...validInputBase, completedAt: false },
        { ...validInputBase, completedAt: [new Date()] },
        { ...validInputBase, completedAt: { completedAt: new Date() } },
        // 値が無効なパターン
        { ...validInputBase, index: -1 },
        { ...validInputBase, index: -10 },
        { ...validInputBase, title: "a".repeat(256) },
        { ...validInputBase, title: "a".repeat(500) },
        { ...validInputBase, description: "a".repeat(1001) },
        { ...validInputBase, completedAt: new Date() },
      ];

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createSection(db, dummyUid, dummyProjectId, dummySectionId, {
            name: "SECTION_NAME",
            index: 0,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

        describe("with valid input", () => {
          for (const input of validInputs) {
            assertCreateTask(
              "success",
              db,
              dummyUid,
              dummyProjectId,
              dummyTaskId,
              input
            );
          }
        });

        describe("with invalid input", () => {
          for (const input of invalidInputs) {
            assertCreateTask(
              "fail",
              db,
              dummyUid,
              dummyProjectId,
              dummyTaskId,
              input
            );
          }
        });
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertCreateTask(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyTaskId,
          validInputs[0]
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertCreateTask(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyTaskId,
          validInputs[0]
        );
      });
    });

    describe("update", () => {
      const dummyTaskId = "TASK_ID";
      // TODO: テストケース追加
      const validInputs = [{ title: "UPDATED_TASK" }];
      const invalidInputs = [{ title: 1 }];

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createTask(db, dummyUid, dummyProjectId, dummyTaskId, {
            title: "TASK_TITLE",
            sectionId: null,
            description: "TASK_DESCRIPTION",
            index: 0,
            completedAt: null,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });

        describe("with valid input", () => {
          for (const input of validInputs) {
            assertUpdateTask(
              "success",
              db,
              dummyUid,
              dummyProjectId,
              dummyTaskId,
              input
            );
          }
        });

        describe("with invalid input", () => {
          for (const input of invalidInputs) {
            assertUpdateTask(
              "fail",
              db,
              dummyUid,
              dummyProjectId,
              dummyTaskId,
              input
            );
          }
        });
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertUpdateTask(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyTaskId,
          validInputs[0]
        );
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertUpdateTask(
          "fail",
          db,
          dummyUid,
          dummyProjectId,
          dummyTaskId,
          validInputs[0]
        );
      });
    });

    describe("delete", () => {
      const dummyTaskId = "TASK_ID";

      beforeEach(async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        await assertSucceeds(
          createTask(db, dummyUid, dummyProjectId, dummyTaskId, {
            title: "TASK_TITLE",
            sectionId: null,
            description: "TASK_DESCRIPTION",
            index: 0,
            completedAt: null,
          })
        );
      });

      describe("from myself", async () => {
        const db = await getDb({ authenticateWith: dummyUid });
        assertDeleteTask("success", db, dummyUid, dummyProjectId, dummyTaskId);
      });

      describe("from another user", async () => {
        const db = await getDb({ authenticateWith: "ANOTHER_USER_ID" });
        assertDeleteTask("fail", db, dummyUid, dummyProjectId, dummyTaskId);
      });

      describe("from unauthenticated user", async () => {
        const db = await getDb();
        assertDeleteTask("fail", db, dummyUid, dummyProjectId, dummyTaskId);
      });
    });
  });
});
