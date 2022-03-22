import { getTestEnvironment } from "./firebase";

export type DbOptions = {
  authenticateWith?: string;
};

export const clearDb = async () => {
  const env = await getTestEnvironment();
  await env.clearFirestore();
};

export const getDb = async (options?: DbOptions) => {
  const env = await getTestEnvironment();
  const context = (() => {
    if (options?.authenticateWith) {
      return env.authenticatedContext(options.authenticateWith);
    } else {
      return env.unauthenticatedContext();
    }
  })();
  return context.firestore();
};
