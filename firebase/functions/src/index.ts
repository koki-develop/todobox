import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp(functions.firebaseConfig() ?? undefined);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const deleteUser = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onCall(async (_data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Unauthenticated"
      );
    }
    const { uid } = context.auth;
    await admin.auth().deleteUser(uid);
  });
