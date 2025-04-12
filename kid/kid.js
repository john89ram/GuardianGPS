document.getElementById("sendLocation").addEventListener("click", () => {
  const status = document.getElementById("status");
  status.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude, altitude } = position.coords;
    console.log("📍 Raw Coordinates:", {
      latitude,
      longitude,
      altitude: altitude ?? "null",
      accuracy: position.coords.accuracy,
      altitudeAccuracy: position.coords.altitudeAccuracy
    });

    const terrainElevation = await getTerrainElevation(latitude, longitude);
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const lat = latitude.toFixed(6);
    const lng = longitude.toFixed(6);
    const alt = altitude ? altitude.toFixed(1) : null;
    const elev = terrainElevation !== null ? terrainElevation.toFixed(1) : null;

    let agl = null;
    let aglMessage = "";

    if (alt && elev) {
      agl = (alt - elev).toFixed(1);
      aglMessage = `AGL (above ground): ${agl} meters${agl < 0 ? " (below ground level or GPS variance)" : ""}`;
    }

    // Construct full message
    let message = `Hi Dad,

📍 Location Update:
Latitude: ${lat}
Longitude: ${lng}`;

    if (alt) message += `\nDevice Altitude: ${alt} meters`;
    if (elev) message += `\nGround Elevation: ${elev} meters`;
    if (agl !== null) message += `\n${aglMessage}`;

    message += `

🗺️ View on Map: ${googleMapsLink}

Love,
Your favorite kid 😄`;

    sendEmail(message);
    status.textContent = "Location sent!";
  }, (err) => {
    status.textContent = "Error getting location: " + err.message;
    console.error("❌ Geolocation Error:", err);
  }, { enableHighAccuracy: true });
});

async function getTerrainElevation(lat, lng) {
  const url = `/.netlify/functions/getElevation?lat=${lat}&lng=${lng}`;
  console.log("🔍 Calling Netlify Function:", url);

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("📦 Elevation from Netlify Function:", data);

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const elevation = data.results[0].elevation;
      console.log("✅ Elevation (meters above sea level):", elevation);
      return elevation;
    } else {
      console.warn("⚠️ Elevation API response not OK:", data.status);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching elevation:", error);
    return null;
  }
}

function sendEmail(message) {
  emailjs.init(EMAILJS_USER_ID);
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: PARENT_EMAIL,
    message: message
  }).then(() => {
    console.log("📨 Email sent!");
  }).catch((err) => {
    console.error("❌ Email send failed:", err);
    document.getElementById("status").textContent = "Failed to send email.";
  });
}
