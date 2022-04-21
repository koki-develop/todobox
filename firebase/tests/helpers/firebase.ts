import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";

const FIREBASE_PROJECT_ID = "test-todobox";

export const getTestEnvironment = async () => {
  const firestoreRules = fs.readFileSync("firestore.rules", "utf8");

  return await initializeTestEnvironment({
    projectId: FIREBASE_PROJECT_ID,
    firestore: {
      rules: firestoreRules,
    },
  });
};

export const cleanupTestEnvironment = async () => {
  const env = await getTestEnvironment();
  await env.cleanup();
};
