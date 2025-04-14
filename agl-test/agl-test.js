<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GuardianGPS - AGL Testing</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="../styles.css" />
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; background: #f4f4f4; }
    button { padding: 10px 20px; margin-top: 1rem; }
    #feedback { margin-top: 2rem; display: none; }
    label { display: block; margin: 1rem 0 0.5rem; }
  </style>

  <!-- EmailJS -->
  <script src="https://cdn.emailjs.com/dist/email.min.js"></script>
  <script>
    emailjs.init("XZpDjjUIyCedr-e4n");
  </script>

  <!-- Firebase (INLINE CONFIG for dev) -->
  <script type="module">
    // Initialize Firebase app before JS loads
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCRMzmmJ9oB88p_meJBK-bPVpvXNO3utQY",
      authDomain: "guardiangps-6dd09.firebaseapp.com",
      projectId: "guardiangps-6dd09",
      storageBucket: "guardiangps-6dd09.appspot.com",
      messagingSenderId: "869285753682",
      appId: "1:869285753682:web:6a86c43d3b0c3f1f7c808b"
    };

    initializeApp(firebaseConfig);
  </script>
</head>
<body>
  <h1>GuardianGPS - AGL Testing</h1>
  <p>Click the button to estimate your current floor based on GPS.</p>

  <button id="runTest">Run AGL Test</button>
  <p id="status"></p>

  <div id="output" style="margin-top: 2rem;"></div>

  <div id="feedback">
    <h3>Was the floor estimate correct?</h3>
    <button id="yesBtn">✅ Yes</button>
    <button id="noBtn" onclick="document.getElementById('correctionForm').style.display = 'block'">❌ No</button>

    <div id="correctionForm" style="display: none; margin-top: 1rem;">
      <label for="floorInput">What floor are you on?</label>
      <input type="text" id="floorInput" placeholder="e.g., Ground, 3rd, 15th" />
      <button id="sendCorrection">Send Correction</button>
    </div>
  </div>

  <!-- Your logic script with type="module" -->
  <script type="module" src="./agl-test.js"></script>
</body>
</html>
