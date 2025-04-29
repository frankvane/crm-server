const axios = require("axios");

async function testLogin() {
  try {
    const response = await axios.post("http://localhost:3000/api/auth/login", {
      username: "admin",
      password: "admin123",
    });

    console.log("Login Response:", response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

testLogin();
