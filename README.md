📍 GuardianGPS
GuardianGPS is a simple web-based location tracking system for parents and kids.
It allows kids to send their current location (including elevation) via email, and gives parents a separate tracking portal to initiate location checks.

🔐 Features
👦 Kid Portal
“Send My Location” button

Sends Latitude, Longitude, and Altitude (if available)

Uses the browser’s GPS + EmailJS to email location to parent

👨‍👩‍👧 Parent Portal
“Track Now” button

Sends a ping request that the Kid Portal listens for

Triggers a location check from the kid’s device if the portal is open

🗂️ Project Structure
pgsql
Copy
GuardianGPS/
├── kid/              # Web app for kids to check in
│   ├── index.html
│   ├── script.js
│   ├── emailjs_config.js
│   └── style.css
├── parent/           # Web app for parents to send "Track Now"
│   ├── index.html
│   ├── script.js
│   └── style.css
└── README.md         # You're reading it
🚀 Getting Started
1. Clone the Repo
bash
Copy
git clone https://github.com/john89ram/GuardianGPS.git
cd GuardianGPS
2. Set Up EmailJS
Go to https://emailjs.com

Create a free account

Add an email service (like Gmail)

Create a template with this variable: {{message}}

Get your:

Service ID

Template ID

Public Key

Add those into kid/emailjs_config.js and kid/script.js.

🧪 Testing Locally
Open kid/index.html in a browser (ideally on a phone).
Click Send My Location → you should receive an email with GPS and elevation.

Open parent/index.html to initiate a “Track Now” ping (once wired).

🛣️ Roadmap
 Kid sends location via email (X, Y, Z)

 Parent “Track Now” button → triggers kid check-in

 Auto hourly updates (if page is open)

 Background service support

 Firebase or SMS integration (v2)

💡 Credits
Created by Jonathan Ramirez
Maintained with 💙 for family safety and independence.