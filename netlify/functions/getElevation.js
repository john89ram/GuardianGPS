const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { lat, lng } = event.queryStringParameters;

  if (!lat || !lng) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing lat or lng" })
    };
  }

  const apiKey = process.env.GOOGLE_ELEVATION_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // enable CORS
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch elevation data", details: error.message })
    };
  }
};
