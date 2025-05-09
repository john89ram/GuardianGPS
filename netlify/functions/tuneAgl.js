const admin = require("firebase-admin");

let initialized = false;

exports.handler = async () => {
  try {
    console.log("🔐 Reading service account key...");
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
    console.log("✅ Parsed service account key");

    if (!initialized) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      initialized = true;
      console.log("🔥 Firebase Admin initialized");
    }

    const db = admin.firestore();
    const snapshot = await db.collection("aglLogs").get();
    console.log(`📦 Retrieved ${snapshot.size} documents from 'aglLogs'`);

    const floorGroups = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const floor = data.confirmed ? data.estimatedFloor : data.actualFloor;
      const agl = parseFloat(data.agl);
      if (!floor || isNaN(agl)) return;

      if (!floorGroups[floor]) floorGroups[floor] = [];
      floorGroups[floor].push(agl);
    });

    const getStats = arr => {
      arr.sort((a, b) => a - b);
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      const mid = Math.floor(arr.length / 2);
      const median = arr.length % 2 === 0
        ? (arr[mid - 1] + arr[mid]) / 2
        : arr[mid];
      return {
        min: arr[0],
        max: arr[arr.length - 1],
        avg: +avg.toFixed(2),
        median: +median.toFixed(2),
        count: arr.length
      };
    };

    const ranges = {};
    const ordered = Object.entries(floorGroups)
      .map(([label, agls]) => [label, getStats(agls)])
      .sort(([, a], [, b]) => a.median - b.median);

    const thresholds = [];

    for (let i = 0; i < ordered.length; i++) {
      const [label, stats] = ordered[i];
      ranges[label] = stats;

      const lower = i === 0 ? -Infinity : (ordered[i - 1][1].max + stats.min) / 2;
      const upper = i === ordered.length - 1 ? Infinity : (stats.max + (ordered[i + 1]?.[1]?.min ?? stats.max)) / 2;

      thresholds.push({
        floor: label,
        range: [parseFloat(lower.toFixed(2)), parseFloat(upper.toFixed(2))]
      });
    }

    console.log("📥 Writing thresholds to Firestore...");

    await db.collection("config").doc("floorThresholds").set({
      updated: admin.firestore.FieldValue.serverTimestamp(),
      thresholds,
      ranges
    });

    console.log("✅ Saved thresholds to Firestore");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Thresholds computed and saved to Firestore",
        thresholds,
        ranges
      })
    };
  } catch (err) {
    console.error("❌ Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
