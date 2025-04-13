exports.handler = async function () {
    try {
      const configString = process.env.firebaseConfig;
      const config = JSON.parse(configString); // Convert stringified JSON to real object
  
      return {
        statusCode: 200,
        body: JSON.stringify(config)
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to load Firebase config." })
      };
    }
  };
  