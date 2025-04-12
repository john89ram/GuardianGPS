document.getElementById("sendLocation").addEventListener("click", () => {
  const status = document.getElementById("status");
  status.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude, altitude } = position.coords;
    console.log("Device Coordinates:", position.coords);

    const terrainElevation = await getTerrainElevation(latitude, longitude);
    console.log("Terrain Elevation:", terrainElevation);

    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    let message;

    if (altitude && terrainElevation !== null) {
      const agl = (altitude - terrainElevation).toFixed(2);
      message = `Hi Dad,

📍 Location Update:
Latitude: ${latitude}
Longitude: ${longitude}
Altitude Above Ground (AGL): ${agl} meters

🗺️ View on Map: ${googleMapsLink}`;
    } else {
      message = `Hi Dad,

📍 Location Update:
Latitude: ${latitude}
Longitude: ${longitude}
Device-reported Altitude: ${altitude ?? "Not available"}
Ground Elevation: ${terrainElevation ?? "Not available"}

🗺️ View on Map: ${googleMapsLink}`;
    }

    sendEmail(message);
    status.textContent = "Location sent!";
  }, (err) => {
    status.textContent = "Error getting location: " + err.message;
    console.error(err);
  }, { enableHighAccuracy: true });
});

async function getTerrainElevation(lat, lng) {
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${GOOGLE_ELEVATION_API_KEY}`);
    const data = await res.json();
    return data.results?.[0]?.elevation ?? null;
  } catch (error) {
    console.error("Elevation fetch failed:", error);
    return null;
  }
}

function sendEmail(message) {
  emailjs.init(EMAILJS_USER_ID);
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: PARENT_EMAIL,
    message: message
  }).then(() => {
    console.log("Email sent!");
  }).catch((err) => {
    console.error("Email send failed:", err);
    document.getElementById("status").textContent = "Failed to send email.";
  });
}
