const firebase = require("./firebase/cred");
const express = require("express");
const db = firebase.firestore;
const pbk = require("pbkdf2");
//const app = express(); -> this creates a new app
const jwt = require("jsonwebtoken");

const cors = require("cors");
require("dotenv").config();
const auth = express.Router();
auth.use(express.json());

const options = {
  origin: "*",
  methods: "GET, POST, DELETE"
}

auth.use(cors(options));

// Should be stored in environment variable, but ok for this demo
const SALT = ";asf;klsadfllsfjalskdfjl";
const JWTSECRET = "abc123";

// Auth Middleware for non expiring tokens
function authMiddleware(req, res, next) {
  console.log("next");
  // Check if proper header exists
  if (req.headers["authorization"]) {
    // Split on space -> should return ["Bearer", "${token}"]
    const headers = req.headers["authorization"].split(" ");
    // Check if first argument is Bearer
    if (headers.length === 2 && headers[0] === "Bearer") {
      //get the token
      let token = headers[1];
      try {
        let decodedToken = jwt.verify(token, JWTSECRET);
        // Set user object which can be accessed in the req
        req.user = decodedToken.username;
        next(); // Go to next function
      } catch (e) {
        return res.status(401).json({ msg: e.message });
      }
    } else {
      return res.status(401).json({ msg: "invalid token" });
    }
  } else {
    return res.status(401).json({ msg: "token was not found in header" });
  }
}

// Creates a user with password, no checks needed
auth.post("/register", async (req, res) => {
  // Get the username and password from request
  const { username, password } = req.body;
  // hash the password
  const passHashed = pbk
    .pbkdf2Sync(password, "SALT", 1000, 32, "sha256")
    .toString();
  // Check for duplicate users
  const check = await db.collection("user").doc(username).get();
  if (check.exists) {
    return res.status(400).json({ msg: "User exists" });
  }
  // TODO: Create the User and fill in user and token
  const user = {passHashed};
  await db.collection('user').doc(username).set(user);
  const token = jwt.sign(user, JWTSECRET);

  // Send JWT Token
  res.json({
    msg: "successfully created",
    data: { username: username },
    token: token,
  });
});

// Verifies password
auth.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const passHashed = pbk
    .pbkdf2Sync(password, "SALT", 1000, 32, "sha256")
    .toString();
  // Get the user
  const check = await db.collection("user").doc(username).get();
  // Check if user exists
  if (!check.exists) {
    return res.status(400).json({ msg: "User does not exist" });
  }
  // Cross reference the stored password with the incoming password (hashed)
  const user = check.data();
  // TODO: fill in samepassword
  let samePassword = (passHashed === user.passHashed);
  if (samePassword) {
    //Issue token if passwords match, else, return a 401, not authorized
    const token = jwt.sign({username}, JWTSECRET);
    return res.json({
      msg: "successfully logged in",
      data: { username: username, pfp: user.pfpID },
      token: token,
    });
  } else {
    return res.status(401).json({ msg: "Username or password was incorrect" });
  }
});

// Example of a protected route
auth.get("/protected", authMiddleware, (req, res) => {
  res.send("User " + req.user + " was authenticated");
});

//app.listen(4000, () => console.log("App listening on port " + 4000));

module.exports = {auth, authMiddleware};