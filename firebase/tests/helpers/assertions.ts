import { assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { it } from "vitest";

export type AssertResult = "success" | "fail";

export const assert = <T>(
  expected: AssertResult,
  actionName: string,
  action: () => Promise<T>
) => {
  switch (expected) {
    case "success":
      it(`should be able to ${actionName}`, async () => {
        await assertSucceeds(action());
      });
      break;
    case "fail":
      it(`should not be able to ${actionName}`, async () => {
        await assertFails(action());
      });
      break;
    default:
      throw new Error(`unknown result: ${expected}`);
  }
};
