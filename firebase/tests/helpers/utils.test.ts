import { describe, it, expect } from "vitest";
import { pickKeys, deleteKeys } from "./utils";

describe("pickKeys", () => {
  const testcases: { obj: any; keys: string[]; expected: any }[] = [
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["a"],
      expected: { a: 1 },
    },
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["a", "b"],
      expected: { a: 1, b: 2 },
    },
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["b", "c"],
      expected: { b: 2, c: 3 },
    },
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["a", "b", "c"],
      expected: { a: 1, b: 2, c: 3 },
    },
  ];

  it("should pick specified key values", () => {
    for (const testcase of testcases) {
      expect(pickKeys(testcase.obj, ...testcase.keys)).toEqual(
        testcase.expected
      );
    }
  });
});

describe("deleteKeys", () => {
  const testcases: { obj: any; keys: string[]; expected: any }[] = [
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["a"],
      expected: { b: 2, c: 3 },
    },
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["a", "b"],
      expected: { c: 3 },
    },
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["b", "c"],
      expected: { a: 1 },
    },
    {
      obj: { a: 1, b: 2, c: 3 },
      keys: ["a", "b", "c"],
      expected: {},
    },
  ];

  it("should delete specified key values", () => {
    for (const testcase of testcases) {
      expect(deleteKeys(testcase.obj, ...testcase.keys)).toEqual(
        testcase.expected
      );
    }
  });
});
