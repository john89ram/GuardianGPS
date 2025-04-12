document.getElementById("sendLocation").addEventListener("click", () => {
  const status = document.getElementById("status");
  status.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude, altitude } = position.coords;
    console.log("📍 Device Coordinates:", position.coords);

    const terrainElevation = await getTerrainElevation(latitude, longitude);
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    let message;

    if (altitude && terrainElevation !== null) {
      const agl = (altitude - terrainElevation).toFixed(2);
      message = `Hi Dad,

📍 Location Update:
Latitude: ${latitude}
Longitude: ${longitude}
Altitude Above Ground (AGL): ${agl} meters

🗺️ View on Map: ${googleMapsLink}

Love,
Your favorite kid 😄`;
    } else {
      message = `Hi Dad,

📍 Location Update:
Latitude: ${latitude}
Longitude: ${longitude}
Device-reported Altitude: ${altitude ?? "Not available"}
Ground Elevation: ${terrainElevation ?? "Not available"}

🗺️ View on Map: ${googleMapsLink}

Love,
Your favorite kid 😄`;
    }

    sendEmail(message);
    status.textContent = "Location sent!";
  }, (err) => {
    status.textContent = "Error getting location: " + err.message;
    console.error("❌ Geolocation Error:", err);
  }, { enableHighAccuracy: true });
});

async function getTerrainElevation(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${GOOGLE_ELEVATION_API_KEY}`;
  console.log("🔍 Fetching Elevation Data...");
  console.log("🌐 Request URL:", url);

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("📦 Elevation API Response:", data);

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const elevation = data.results[0].elevation;
      console.log("✅ Elevation (meters above sea level):", elevation);
      return elevation;
    } else {
      console.warn("⚠️ Elevation API returned unexpected data:", data.status);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to fetch elevation data:", error);
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
