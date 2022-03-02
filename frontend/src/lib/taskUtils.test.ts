import { describe, expect, it } from "vitest";
import { Task } from "@/models/task";
import { moveTask, moveTasks, insertTasksToTasks } from "./taskUtils";

describe("moveTask", () => {
  type Args = [
    Task[],
    {
      taskId: string;
      toSectionId: string | null;
      toIndex: number;
    }
  ];
  const testcases: { args: Args; expected: Task[] }[] = [
    // 同一セクション内の移動
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          taskId: "TASK_1",
          toSectionId: null,
          toIndex: 1,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 1, id: "TASK_1", title: "task 1" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          taskId: "TASK_2",
          toSectionId: null,
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 1, id: "TASK_1", title: "task 1" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          taskId: "TASK_3",
          toSectionId: "SECTION_1",
          toIndex: 1,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          taskId: "TASK_4",
          toSectionId: "SECTION_1",
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
      ],
    },

    // 異なるセクション間の移動
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          taskId: "TASK_1",
          toSectionId: "SECTION_1",
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, id: "TASK_2", index: 0, title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 2, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          taskId: "TASK_1",
          toSectionId: "SECTION_1",
          toIndex: 1,
        },
      ],
      expected: [
        { sectionId: null, id: "TASK_2", index: 0, title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_1", title: "task 1" },
        { sectionId: "SECTION_1", index: 2, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          taskId: "TASK_3",
          toSectionId: "SECTION_2",
          toIndex: 2,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        { sectionId: "SECTION_2", index: 2, id: "TASK_3", title: "task 3" },
      ],
    },

    // 移動先のセクションが空のパターン
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
        ],
        {
          taskId: "TASK_1",
          toSectionId: "SECTION_2",
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_1", title: "task 1" },
      ],
    },
  ];

  for (const testcase of testcases) {
    it(`moveTask(${JSON.stringify(testcase.args[0])}, ${
      testcase.args[1].taskId
    }, ${testcase.args[1].toSectionId}, ${
      testcase.args[1].toIndex
    }) to equal ${JSON.stringify(testcase.expected)}`, () => {
      expect(
        moveTask(
          testcase.args[0],
          testcase.args[1].taskId,
          testcase.args[1].toSectionId,
          testcase.args[1].toIndex
        )
      ).toEqual(testcase.expected);
    });
  }
});

describe("moveTasks", () => {
  type Args = [
    Task[],
    {
      taskIds: string[];
      toSectionId: string | null;
      toIndex: number;
    }
  ];
  const testcases: { args: Args; expected: Task[] }[] = [
    // 同一セクション内の移動
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_2"],
          toSectionId: null,
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_2"],
          toSectionId: null,
          toIndex: 1,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_2"],
          toSectionId: null,
          toIndex: 2,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 1, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 2, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_2"],
          toSectionId: null,
          toIndex: 3,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 1, id: "TASK_4", title: "task 4" },
        { sectionId: null, index: 2, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 3, id: "TASK_2", title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_3"],
          toSectionId: null,
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 2, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_3"],
          toSectionId: null,
          toIndex: 1,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 1, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_3"],
          toSectionId: null,
          toIndex: 2,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 1, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_3"],
          toSectionId: null,
          toIndex: 3,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 1, id: "TASK_4", title: "task 4" },
        { sectionId: null, index: 2, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 3, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },

    // 異なるセクション間の移動
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_3"],
          toSectionId: "SECTION_1",
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 1, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 2, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_1", index: 3, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: null, index: 2, id: "TASK_3", title: "task 3" },
          { sectionId: null, index: 3, id: "TASK_4", title: "task 4" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 3" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 4" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_7", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_8", title: "task 6" },
        ],
        {
          taskIds: ["TASK_1", "TASK_5"],
          toSectionId: "SECTION_2",
          toIndex: 0,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_2", title: "task 2" },
        { sectionId: null, index: 1, id: "TASK_3", title: "task 3" },
        { sectionId: null, index: 2, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_6", title: "task 4" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_5", title: "task 3" },
        { sectionId: "SECTION_2", index: 2, id: "TASK_7", title: "task 5" },
        { sectionId: "SECTION_2", index: 3, id: "TASK_8", title: "task 6" },
      ],
    },
  ];
  for (const testcase of testcases) {
    it(`moveTasks(${JSON.stringify(testcase.args[0])}, ${JSON.stringify(
      testcase.args[1].taskIds
    )}, ${testcase.args[1].toSectionId}, ${
      testcase.args[1].toIndex
    }) to equal ${JSON.stringify(testcase.expected)}`, () => {
      expect(
        moveTasks(
          testcase.args[0],
          testcase.args[1].taskIds,
          testcase.args[1].toSectionId,
          testcase.args[1].toIndex
        )
      ).toEqual(testcase.expected);
    });
  }
});

describe("insertTasksToTasks", () => {
  type Args = [Task[], Task[], { sectionId: string | null; index: number }];
  const testcases: { args: Args; expected: Task[] }[] = [
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_4", title: "task 4" },
        ],
        [
          { sectionId: "SECTION_2", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_2", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          sectionId: "SECTION_2",
          index: 1,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_4", title: "task 4" },
        { sectionId: "SECTION_2", index: 1, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_2", index: 2, id: "TASK_6", title: "task 6" },
      ],
    },
    {
      args: [
        [
          { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
          { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
          { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
          { sectionId: "SECTION_2", index: 0, id: "TASK_4", title: "task 4" },
        ],
        [
          { sectionId: "SECTION_1", index: 0, id: "TASK_5", title: "task 5" },
          { sectionId: "SECTION_1", index: 1, id: "TASK_6", title: "task 6" },
        ],
        {
          sectionId: "SECTION_1",
          index: 1,
        },
      ],
      expected: [
        { sectionId: null, index: 0, id: "TASK_1", title: "task 1" },
        { sectionId: null, index: 1, id: "TASK_2", title: "task 2" },
        { sectionId: "SECTION_1", index: 0, id: "TASK_3", title: "task 3" },
        { sectionId: "SECTION_1", index: 1, id: "TASK_5", title: "task 5" },
        { sectionId: "SECTION_1", index: 2, id: "TASK_6", title: "task 6" },
        { sectionId: "SECTION_2", index: 0, id: "TASK_4", title: "task 4" },
      ],
    },
  ];
  for (const testcase of testcases) {
    it("hogefuga", () => {
      expect(
        insertTasksToTasks(
          testcase.args[0],
          testcase.args[1],
          testcase.args[2].sectionId,
          testcase.args[2].index
        )
      ).toEqual(testcase.expected);
    });
  }
});
