const { readdirSync } = require("graceful-fs");
const { expressJwtSecret } = require("jwks-rsa");
const retryRequest = require("retry-request");
const firebase = require("./firebase/cred.js");
const express = require("express");
const db = firebase.firestore;
const pbk = require("pbkdf2");
const app = express();
app.use(express.json());
const cors = require("cors");
require("dotenv").config();


// Should be stored in environment variable, but ok for this demo -> prevents password hashing collisions
const SALT = ";asf;klsadfllsfjalskdfjl";

// Creates a user with password, no checks needed
app.post("/password", async (req, res) => {
  // Get the username and password from request
  const { username, password } = req.body;
  const encrypted = pbk.pbkdf2Sync(password, SALT, 1000, 32, 'sha256').toString();
  // Create the User
  const user = {
    password: encrypted
  }

  await db.collection('user').doc(username).set(user);
  res.status(200).send("UserCreated");

});

// Verifies password
app.post("/verifyPassword", async (req, res) => {
  const { username, password } = req.body;
  const encrypted = pbk.pbkdf2Sync(password, SALT, 1000, 32, 'sha256').toString();
  // Set this to when you check the password
  let samePassword = false;
  // Get the user
  const query = await db.collection("user").doc(username).get();
  const data = query.data();
  // Cross check the user's password with the passwordHash
  samePassword = (encrypted === data.password);
  // Send arbitrary message
  if (samePassword) {
    res.send("Password Verified!");
  } else {
    res.send("Password Invalid!");
  }
});

app.listen(4000, () => console.log("App listening on port " + 4000));
