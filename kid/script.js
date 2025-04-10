const SERVICE_ID = "service_017si3q";
const TEMPLATE_ID = "template_j2j5ij8";
const PING_URL = "https://api.npoint.io/52e1cb70100d9bf4e140";

function sendLocation(reason = "Manual check-in") {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText = "Getting location...";

  if (!navigator.geolocation) {
    statusDiv.innerText = "Geolocation is not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude, altitude } = position.coords;
    const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const altText = altitude !== null ? `${altitude.toFixed(2)} meters` : "Unavailable";

    const message = `
📍 GuardianGPS Check-In
Reason: ${reason}
Latitude: ${latitude}
Longitude: ${longitude}
Altitude: ${altText}
Google Maps: ${mapLink}
`;

    emailjs.send(SERVICE_ID, TEMPLATE_ID, { message })
      .then(() => {
        statusDiv.innerText = "Location sent!";
      })
      .catch((error) => {
        console.error("Email error:", error);
        statusDiv.innerText = "Failed to send location.";
      });

  }, () => {
    statusDiv.innerText = "Could not retrieve location.";
  });
}

// 🔄 Track Now Listener – checks every 60s
setInterval(async () => {
  try {
    const res = await fetch(PING_URL);
    const { ping } = await res.json();

    if (ping === true) {
      console.log("Track Now ping detected — sending location...");
      sendLocation("Track Now ping");

      // Reset the ping
      await fetch(PING_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: false })
      });
    }
  } catch (err) {
    console.warn("Ping check failed:", err.message);
  }
}, 60000);
