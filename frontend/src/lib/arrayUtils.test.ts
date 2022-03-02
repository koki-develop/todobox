import { describe, it, expect } from "vitest";
import { arrayMove, arrayMoveToArray } from "./arrayUtils";

describe("arrayMove", () => {
  type Args = [number[], { from: number; to: number }];
  const testcases: { args: Args; expected: number[] }[] = [
    {
      args: [[1, 2, 3, 4, 5], { from: 0, to: 1 }],
      expected: [2, 1, 3, 4, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 1, to: 3 }],
      expected: [1, 3, 4, 2, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 2, to: 1 }],
      expected: [1, 3, 2, 4, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 4, to: 0 }],
      expected: [5, 1, 2, 3, 4],
    },

    // 移動しないパターン
    {
      args: [[1, 2, 3, 4, 5], { from: 0, to: 0 }],
      expected: [1, 2, 3, 4, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 1, to: 1 }],
      expected: [1, 2, 3, 4, 5],
    },

    // インデックスを飛び出るパターン
    {
      args: [[1, 2, 3, 4, 5], { from: -10, to: -10 }],
      expected: [1, 2, 3, 4, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 10, to: 10 }],
      expected: [1, 2, 3, 4, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 1, to: 10 }],
      expected: [1, 3, 4, 5, 2],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: -10, to: 3 }],
      expected: [2, 3, 4, 1, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 3, to: -10 }],
      expected: [4, 1, 2, 3, 5],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: -10, to: 10 }],
      expected: [2, 3, 4, 5, 1],
    },
    {
      args: [[1, 2, 3, 4, 5], { from: 10, to: -10 }],
      expected: [5, 1, 2, 3, 4],
    },
  ];
  for (const testcase of testcases) {
    it(`arrayMove(${JSON.stringify(testcase.args[0])}, ${
      testcase.args[1].from
    }, ${testcase.args[1].to}) to equal ${JSON.stringify(
      testcase.expected
    )}`, () => {
      const actual = arrayMove(
        testcase.args[0],
        testcase.args[1].from,
        testcase.args[1].to
      );
      expect(actual).toEqual(testcase.expected);
    });
  }
});

describe("arrayMoveToArray", () => {
  type Args = [number[], number[], { from: number; to: number }];
  const testcases: { args: Args; expected: [number[], number[]] }[] = [
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 0, to: 0 }],
      expected: [
        [2, 3, 4, 5],
        [1, 6, 7, 8, 9, 10],
      ],
    },
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 0, to: 1 }],
      expected: [
        [2, 3, 4, 5],
        [6, 1, 7, 8, 9, 10],
      ],
    },
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 2, to: 4 }],
      expected: [
        [1, 2, 4, 5],
        [6, 7, 8, 9, 3, 10],
      ],
    },
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 4, to: 2 }],
      expected: [
        [1, 2, 3, 4],
        [6, 7, 5, 8, 9, 10],
      ],
    },
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 4, to: 5 }],
      expected: [
        [1, 2, 3, 4],
        [6, 7, 8, 9, 10, 5],
      ],
    },

    // インデックスを飛び出るパターン
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 10, to: 10 }],
      expected: [
        [1, 2, 3, 4],
        [6, 7, 8, 9, 10, 5],
      ],
    },
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 0, to: 1 }],
      expected: [
        [2, 3, 4, 5],
        [6, 1, 7, 8, 9, 10],
      ],
    },
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 2, to: 4 }],
      expected: [
        [1, 2, 4, 5],
        [6, 7, 8, 9, 3, 10],
      ],
    },
    {
      args: [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], { from: 4, to: 2 }],
      expected: [
        [1, 2, 3, 4],
        [6, 7, 5, 8, 9, 10],
      ],
    },
  ];
  for (const testcase of testcases) {
    it(`arrayMoveToArray(${JSON.stringify(testcase.args[0])}, ${JSON.stringify(
      testcase.args[1]
    )}, ${testcase.args[2].from}, ${
      testcase.args[2].to
    }) to equal ${JSON.stringify(testcase.expected)}}`, () => {
      const [actual1, actual2] = arrayMoveToArray(
        testcase.args[0],
        testcase.args[1],
        testcase.args[2].from,
        testcase.args[2].to
      );
      expect(actual1).toEqual(testcase.expected[0]);
      expect(actual2).toEqual(testcase.expected[1]);
    });
  }
});
