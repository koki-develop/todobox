import { assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { it } from "vitest";

export type AssertResult = "success" | "fail";

export const assert = <T>(
  expected: AssertResult,
  messages: { success: string; fail: string },
  action: () => Promise<T>
) => {
  switch (expected) {
    case "success":
      it(messages.success, async () => {
        await assertSucceeds(action());
      });
      break;
    case "fail":
      it(messages.fail, async () => {
        await assertFails(action());
      });
      break;
    default:
      throw new Error(`unknown result: ${expected}`);
  }
};
