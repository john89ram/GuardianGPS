// Firebase imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import { firebaseConfig } from "./config.js";

// ✅ EmailJS
import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@3.11.0/+esm";
emailjs.init("XZpDjjUIyCedr-e4n"); // Your public key

// ✅ Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

let coords = {};
let aglData = {};

document.getElementById("runTest").addEventListener("click", async () => {
  document.getElementById("status").textContent = "Running AGL Test...";

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude, altitude } = pos.coords;
    coords = { latitude, longitude, altitude };

    // Fetch terrain elevation
    const url = `/.netlify/functions/getElevation?lat=${latitude}&lng=${longitude}`;
    console.log("📡 Fetching elevation:", url);

    let ground = null;
    let agl = null;

    try {
      const res = await fetch(url);
      const data = await res.json();

      ground = data.results?.[0]?.elevation ?? null;
      agl = altitude !== null && ground !== null ? (altitude - ground).toFixed(2) : null;
    } catch (err) {
      console.warn("⚠️ Failed to fetch elevation — continuing anyway", err);
      document.getElementById("status").textContent = "⚠️ Elevation unavailable. Estimating from GPS data only.";
    }

    aglData = {
      altitude: altitude ?? "Unavailable",
      ground: ground ?? "Unavailable",
      agl,
      estimatedFloor: getFloorFromAGL(agl)
    };

    renderResults();
  }, (error) => {
    console.error("❌ Geolocation error:", error);
    document.getElementById("status").textContent = "Failed to get device location.";
  });
});

function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function getFloorFromAGL(agl) {
  if (agl == null || isNaN(agl)) return "Unknown";
  const val = parseFloat(agl);
  if (val < -3) return "Underground";
  if (val < 2) return "Ground";
  if (val < 6) return "1st Floor";
  if (val < 10) return "2nd Floor";
  if (val < 15) return "3rd Floor";
  if (val < 30) return "4th-10th Floor";
  return "High Rise";
}

function renderResults() {
  const out = document.getElementById("output");
  out.innerHTML = `
    Latitude: ${coords.latitude?.toFixed(6)}<br>
    Longitude: ${coords.longitude?.toFixed(6)}<br>
    Device Altitude: ${isNumeric(aglData.altitude) ? aglData.altitude + " m" : "Unavailable"}<br>
    Ground Elevation: ${isNumeric(aglData.ground) ? aglData.ground + " m" : "Unavailable"}<br>
    AGL: ${isNumeric(aglData.agl) ? aglData.agl + " m" : "Unavailable"}<br>
    Estimated Floor: ${aglData.estimatedFloor}<br>
    🗺️ <a href="https://www.google.com/maps?q=${coords.latitude},${coords.longitude}" target="_blank">View on Map</a>
  `;
  document.getElementById("feedback").style.display = "block";
}

document.getElementById("yesBtn").addEventListener("click", async () => {
  await sendLogToFirebase(true);
  await sendEmail(true);
  redirectAfterSubmit();
});

document.getElementById("sendCorrection").addEventListener("click", async () => {
  const floor = document.getElementById("floorInput").value.trim();
  if (!floor) return alert("Please enter the correct floor.");

  await sendLogToFirebase(false, floor);
  await sendEmail(false, floor);
  redirectAfterSubmit();
});

async function sendLogToFirebase(confirmed, floor = null) {
  try {
    const docRef = await addDoc(collection(db, "aglLogs"), {
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: aglData.altitude,
      ground: aglData.ground,
      agl: aglData.agl,
      estimatedFloor: aglData.estimatedFloor,
      actualFloor: floor,
      confirmed,
      timestamp: serverTimestamp()
    });
    console.log("📝 Log saved:", docRef.id);
  } catch (err) {
    console.error("❌ Failed to write to Firestore", err);
  }
}

async function sendEmail(confirmed, correctedFloor = null) {
  const templateParams = {
    to_email: "john89ram@gmail.com",
    subject: "📍 AGL Correction Submission",
    message: `
📍 AGL Correction Submission:

Latitude: ${coords.latitude}
Longitude: ${coords.longitude}
Device Altitude: ${aglData.altitude}
Ground Elevation: ${aglData.ground}
AGL: ${aglData.agl}

Estimated Floor: ${aglData.estimatedFloor}
${confirmed ? "✅ User confirmed floor estimate." : `❌ User reported actual floor: ${correctedFloor}`}
`
  };

  try {
    const response = await emailjs.send("service_017si3q", "template_j2j5ij8", templateParams);
    console.log("📨 Email sent!", response.status, response.text);
  } catch (err) {
    console.error("❌ Email failed to send:", err);
    alert("⚠️ Failed to send email: " + (err.text || err));
  }
}

function redirectAfterSubmit() {
  window.location.href = "/thankyou.html";
}
