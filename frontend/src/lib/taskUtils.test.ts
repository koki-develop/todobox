import { describe, expect, it } from "vitest";
import { Section } from "@/models/section";
import { Task } from "@/models/task";
import { moveTaskState, moveTasksState, insertTasksToTasks } from "./taskUtils";

const dummySections: Section[] = [
  { projectId: "dummyprojectid", id: "SECTION_1", index: 0, name: "section 1" },
  { projectId: "dummyprojectid", id: "SECTION_2", index: 1, name: "section 2" },
  { projectId: "dummyprojectid", id: "SECTION_3", index: 2, name: "section 3" },
];

const buildTask = (fields: Omit<Task, "projectId" | "completedAt">): Task => {
  return {
    projectId: "dummyprojectid",
    completedAt: null,
    ...fields,
  };
};

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
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          taskId: "TASK_1",
          toSectionId: null,
          toIndex: 1,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_1", title: "task 1" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          taskId: "TASK_2",
          toSectionId: null,
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_1", title: "task 1" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          taskId: "TASK_3",
          toSectionId: "SECTION_1",
          toIndex: 1,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_2", title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          taskId: "TASK_4",
          toSectionId: "SECTION_1",
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_2", title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
      ],
    },

    // 異なるセクション間の移動
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          taskId: "TASK_1",
          toSectionId: "SECTION_1",
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, id: "TASK_2", index: 0, title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_1",
          title: "task 1",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 2,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          taskId: "TASK_1",
          toSectionId: "SECTION_1",
          toIndex: 1,
        },
      ],
      expected: [
        buildTask({ sectionId: null, id: "TASK_2", index: 0, title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_1",
          title: "task 1",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 2,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          taskId: "TASK_3",
          toSectionId: "SECTION_2",
          toIndex: 2,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_2", title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 2,
          id: "TASK_3",
          title: "task 3",
        }),
      ],
    },

    // 移動先のセクションが空のパターン
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_4",
            title: "task 4",
          }),
        ],
        {
          taskId: "TASK_1",
          toSectionId: "SECTION_2",
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_1",
          title: "task 1",
        }),
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
        moveTaskState(
          dummySections,
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
      firstTaskId: string;
      otherTaskIds: string[];
      toSectionId: string | null;
      toIndex: number;
    }
  ];
  const testcases: { args: Args; expected: Task[] }[] = [
    // 同一セクション内の移動
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_2"],
          toSectionId: null,
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_2"],
          toSectionId: null,
          toIndex: 1,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_2"],
          toSectionId: null,
          toIndex: 2,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_2"],
          toSectionId: null,
          toIndex: 3,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_4", title: "task 4" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_2", title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_3"],
          toSectionId: null,
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_3"],
          toSectionId: null,
          toIndex: 1,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_3"],
          toSectionId: null,
          toIndex: 2,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_3"],
          toSectionId: null,
          toIndex: 3,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_4", title: "task 4" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 3, id: "TASK_3", title: "task 3" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },

    // 異なるセクション間の移動
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_3"],
          toSectionId: "SECTION_1",
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_1",
          title: "task 1",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 2,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 3,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_5"],
          toSectionId: "SECTION_2",
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_1",
          title: "task 1",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 2,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 3,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: null,
            index: 2,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: null,
            index: 3,
            id: "TASK_4",
            title: "task 4",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_7",
            title: "task 7",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_8",
            title: "task 8",
          }),
        ],
        {
          firstTaskId: "TASK_1",
          otherTaskIds: ["TASK_5", "TASK_6"],
          toSectionId: "SECTION_1",
          toIndex: 0,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_2", title: "task 2" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_3", title: "task 3" }),
        buildTask({ sectionId: null, index: 2, id: "TASK_4", title: "task 4" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_1",
          title: "task 1",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 2,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_7",
          title: "task 7",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_8",
          title: "task 8",
        }),
      ],
    },
  ];
  for (const testcase of testcases) {
    it(`moveTasks(${JSON.stringify(testcase.args[0])}, ${JSON.stringify(
      testcase.args[1].otherTaskIds
    )}, ${testcase.args[1].toSectionId}, ${
      testcase.args[1].toIndex
    }) to equal ${JSON.stringify(testcase.expected)}`, () => {
      expect(
        moveTasksState(
          dummySections,
          testcase.args[0],
          testcase.args[1].firstTaskId,
          testcase.args[1].otherTaskIds,
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
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_4",
            title: "task 4",
          }),
        ],
        [
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          sectionId: "SECTION_2",
          index: 1,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_2", title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_4",
          title: "task 4",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 1,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 2,
          id: "TASK_6",
          title: "task 6",
        }),
      ],
    },
    {
      args: [
        [
          buildTask({
            sectionId: null,
            index: 0,
            id: "TASK_1",
            title: "task 1",
          }),
          buildTask({
            sectionId: null,
            index: 1,
            id: "TASK_2",
            title: "task 2",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_3",
            title: "task 3",
          }),
          buildTask({
            sectionId: "SECTION_2",
            index: 0,
            id: "TASK_4",
            title: "task 4",
          }),
        ],
        [
          buildTask({
            sectionId: "SECTION_1",
            index: 0,
            id: "TASK_5",
            title: "task 5",
          }),
          buildTask({
            sectionId: "SECTION_1",
            index: 1,
            id: "TASK_6",
            title: "task 6",
          }),
        ],
        {
          sectionId: "SECTION_1",
          index: 1,
        },
      ],
      expected: [
        buildTask({ sectionId: null, index: 0, id: "TASK_1", title: "task 1" }),
        buildTask({ sectionId: null, index: 1, id: "TASK_2", title: "task 2" }),
        buildTask({
          sectionId: "SECTION_1",
          index: 0,
          id: "TASK_3",
          title: "task 3",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 1,
          id: "TASK_5",
          title: "task 5",
        }),
        buildTask({
          sectionId: "SECTION_1",
          index: 2,
          id: "TASK_6",
          title: "task 6",
        }),
        buildTask({
          sectionId: "SECTION_2",
          index: 0,
          id: "TASK_4",
          title: "task 4",
        }),
      ],
    },
  ];
  for (const testcase of testcases) {
    it(`insertTasksToTasks(${JSON.stringify(dummySections)}, ${JSON.stringify(
      testcase.args[0]
    )}, ${JSON.stringify(testcase.args[1])}, ${testcase.args[2].sectionId}, ${
      testcase.args[2].index
    })`, () => {
      expect(
        insertTasksToTasks(
          dummySections,
          testcase.args[0],
          testcase.args[1],
          testcase.args[2].sectionId,
          testcase.args[2].index
        )
      ).toEqual(testcase.expected);
    });
  }
});
