document.getElementById("testAGL").addEventListener("click", () => {
  document.getElementById("results").textContent = "Getting location...";
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude, altitude } = position.coords;
    const terrainElevation = await getTerrainElevation(latitude, longitude);

    const alt = altitude ? altitude.toFixed(1) : null;
    const elev = terrainElevation !== null ? terrainElevation.toFixed(1) : null;
    let agl = null;
    let floorEstimate = "Unknown";

    if (alt && elev) {
      agl = (alt - elev).toFixed(1);
      floorEstimate = estimateFloorFromAGL(agl);
    }

    const lat = latitude.toFixed(6);
    const lng = longitude.toFixed(6);
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

    const resultMsg = `
Latitude: ${lat}
Longitude: ${lng}
Device Altitude: ${alt ?? "Unavailable"} m
Ground Elevation: ${elev ?? "Unavailable"} m
AGL: ${agl ?? "Unavailable"} m
Estimated Floor: ${floorEstimate}
🗺️ <a href="${googleMapsLink}" target="_blank">View on Map</a>
    `;

    document.getElementById("results").innerHTML = resultMsg;
    document.getElementById("feedbackBox").style.display = "block";

    // Save for correction email later
    window._aglTestData = { lat, lng, alt, elev, agl, floorEstimate, googleMapsLink };
  }, (err) => {
    document.getElementById("results").textContent = "Error getting location: " + err.message;
  }, { enableHighAccuracy: true });
});

function estimateFloorFromAGL(agl) {
  agl = parseFloat(agl);
  if (agl < -10) return "Underground";
  if (agl < 3) return "Ground Floor";
  if (agl < 6) return "1st Floor";
  if (agl < 9) return "2nd Floor";
  if (agl < 13) return "3rd Floor";
  if (agl < 20) return "4th–5th Floor";
  return "High Floor / Rooftop";
}

document.getElementById("confirmYes").addEventListener("click", () => {
  const data = window._aglTestData || {};
  const message = `📍 AGL Confirmation Submission:

Latitude: ${data.lat}
Longitude: ${data.lng}
Device Altitude: ${data.alt ?? "N/A"} m
Ground Elevation: ${data.elev ?? "N/A"} m
AGL: ${data.agl ?? "N/A"} m

Estimated Floor: ${data.floorEstimate}
✅ User confirmed this estimate is correct.

Map: ${data.googleMapsLink}
`;

  emailjs.init(EMAILJS_USER_ID);
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: PARENT_EMAIL,
    message: message
  }).then(() => {
    window.location.href = "/thanks.html";
  }).catch((err) => {
    console.error("Email send failed:", err);
    alert("Something went wrong while sending the confirmation.");
  });
});

document.getElementById("confirmNo").addEventListener("click", () => {
  document.getElementById("correctionForm").style.display = "block";
});

document.getElementById("sendCorrection").addEventListener("click", () => {
  const actualFloor = document.getElementById("actualFloor").value.trim();
  if (!actualFloor) return alert("Please enter your actual floor.");

  const data = window._aglTestData || {};
  const correctionMsg = `📍 AGL Correction Submission:

Latitude: ${data.lat}
Longitude: ${data.lng}
Device Altitude: ${data.alt ?? "N/A"} m
Ground Elevation: ${data.elev ?? "N/A"} m
AGL: ${data.agl ?? "N/A"} m

Estimated Floor: ${data.floorEstimate}
❌ User reported actual floor: ${actualFloor}

Map: ${data.googleMapsLink}
`;

  emailjs.init(EMAILJS_USER_ID);
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: PARENT_EMAIL,
    message: correctionMsg
  }).then(() => {
    window.location.href = "/thanks.html";
  }).catch((err) => {
    console.error("Email send failed:", err);
    alert("Something went wrong while sending the correction.");
  });
});

async function getTerrainElevation(lat, lng) {
  try {
    const res = await fetch(`/.netlify/functions/getElevation?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results[0].elevation;
    }
  } catch (err) {
    console.error("Elevation fetch failed:", err);
  }
  return null;
}
