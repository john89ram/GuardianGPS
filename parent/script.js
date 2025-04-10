const PING_URL = "https://api.npoint.io/52e1cb70100d9bf4e140";

async function sendPing() {
  const status = document.getElementById("status");
  status.innerText = "Sending ping...";

  try {
    await fetch(PING_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ping: true })
    });

    status.innerText = "Ping sent. Awaiting check-in...";

    // Auto-reset after 30s so kid portal won't keep sending
    setTimeout(() => {
      fetch(PING_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ping: false })
      });
    }, 30000);
  } catch (err) {
    console.error("Ping error:", err);
    status.innerText = "Error sending ping.";
  }
}
