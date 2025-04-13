const admin = require("firebase-admin");

let app;

exports.handler = async (event, context) => {
  try {
    if (!app) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const db = admin.firestore();
    const aglLog = {
      latitude: 30.123,
      longitude: -97.456,
      agl: 12.3,
      estimatedFloor: "1st Floor",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("aglLogs").add(aglLog);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "AGL log saved!" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to write to Firestore", details: err.message })
    };
  }
};
