const admin = require("firebase-admin");
const fs = require("fs");

console.log("🔥 Starting AGL tuner...");

const keyPath = "./serviceAccountKey.json";

// Check if key file exists
if (!fs.existsSync(keyPath)) {
  console.error("❌ Missing serviceAccountKey.json in project root.");
  process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testFirestoreConnection() {
  console.log("🔗 Connecting to Firestore...");
  try {
    const snapshot = await db.collection("aglLogs").limit(3).get();

    if (snapshot.empty) {
      console.log("📭 No documents found in 'aglLogs'.");
      return;
    }

    console.log("📦 Sample AGL Entries:");
    snapshot.forEach((doc, index) => {
      console.log(`--- Entry ${index + 1} ---`);
      console.log(doc.data());
    });
  } catch (error) {
    console.error("❌ Firestore read error:", error);
  }
}

testFirestoreConnection();
