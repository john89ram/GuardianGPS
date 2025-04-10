const SERVICE_ID = "service_017si3q";
const TEMPLATE_ID = "template_j2j5ij8";

function sendLocation() {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText = "Getting location...";

  if (!navigator.geolocation) {
    statusDiv.innerText = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude, altitude } = position.coords;
    const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const altText = altitude !== null ? `${altitude.toFixed(2)} meters` : "Unavailable";

    const message = `
📍 GuardianGPS Check-In
Latitude: ${latitude}
Longitude: ${longitude}
Altitude: ${altText}
Google Maps: ${mapLink}
`;

    emailjs.send(SERVICE_ID, TEMPLATE_ID, { message })
      .then(() => {
        statusDiv.innerText = "Location sent successfully!";
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        statusDiv.innerText = "Failed to send location.";
      });

  }, () => {
    statusDiv.innerText = "Unable to retrieve your location.";
  });
}
