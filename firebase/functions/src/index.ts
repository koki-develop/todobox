import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp(functions.firebaseConfig() ?? undefined);

const firestore = admin.firestore();
const functionBuilder = functions.runWith({ timeoutSeconds: 300 });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const deleteUser = functionBuilder.https.onCall(
  async (_data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Unauthenticated"
      );
    }
    const { uid } = context.auth;
    await admin.auth().deleteUser(uid);
  }
);

export const handleDeleteUser = functionBuilder.auth
  .user()
  .onDelete(async (user) => {
    const snapshot = await firestore
      .collection(`users/${user.uid}/projects`)
      .get();
    const docs = snapshot.docs;
    for (const doc of docs) {
      await doc.ref.delete();
    }
  });

export const handleDeleteProject = functionBuilder.firestore
  .document("users/{userId}/projects/{projectId}")
  .onDelete(async (_snapshot, context) => {
    const { userId, projectId } = context.params;

    const sectionsSnapshot = await firestore
      .collection(`users/${userId}/projects/${projectId}/sections`)
      .get();
    const tasksSnapshot = await firestore
      .collection(`users/${userId}/projects/${projectId}/tasks`)
      .get();

    for (const doc of sectionsSnapshot.docs) {
      await doc.ref.delete();
    }
    for (const doc of tasksSnapshot.docs) {
      await doc.ref.delete();
    }
  });
