const { readdirSync } = require("graceful-fs");
const { expressJwtSecret } = require("jwks-rsa");
const retryRequest = require("retry-request");
const firebase = require("./firebase/cred.js");
const express = require("express");
const cors = require("cors");
const { JWT } = require("google-auth-library");
const app = express();
const db = firebase.firestore;
const jwt = require('jsonwebtoken');
app.use("/auth", require("./auth").auth);
const auth = require("./auth");
const file = require("./file");
app.use("/file", file);


require("dotenv").config();

app.use(express.json());
const options = {
  origin: "*",
  methods: "GET, POST, DELETE"
}
app.use(cors(options));

//fetch a person's todo's
app.get("/todo/:email", auth.authMiddleware, async(req, res) => {
  //jwt.verify(req.token, auth.JWT); don't do this here, middleware handles it

    const todos = db.collection("todo");
    let email = req.params.email;
    const query = await todos.where("email", "==", email).get();
    const ret = query.docs.map((data) => data.data());
    res.status(200).json(ret);
})

var corsOptions = {
    origin: 'http://localhost:4000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.options('/todo/', cors());

app.post("/todo/", auth.authMiddleware, cors(), async(req, res) => {

  const body = req.body
    if(body.email == undefined || body.todo == undefined) {
        return res.json({
          msg: "Error: body not defined in request",
          data: {},
        });
    }

    let r = (Math.random() + 1).toString(36).substring(2);

    const data = {
        email: req.body.email,
        todo: req.body.todo,
        //randomly generate?
        uid: r
    }

    //best way to handle this?
    const query = await db.collection('todo').doc(data.uid).set(data);
    res.status(200).json(query);
})

app.delete("/todo/", cors(), async(req, res) => {
    const body = req.body;
    console.log(body)
    if(body.uid == undefined) {
        return res.json({
          msg: "Error: uid not defined in request",
          data: {},
        });
    }

    //check taskName too?
    await db.collection("todo").doc(body.uid).delete();
    res.status(200).json("Delete Successful");
})

app.put("/pfp/", cors(), async(req, res) => {

  const body = req.body
    if(body.pfp == undefined || body.username == undefined) {
        return res.json({
          msg: "Error: pfp not defined in request",
          data: {},
        });
    }

    console.log(req.body.username)
    const data = {
      username: req.body.username,
      pfp: body.pfp
    }

    const query = await db.collection("user").doc(data.username).update({pfp: data.pfp});
    res.status(200).json(query);
})

app.listen(process.env["PORT"], () =>
  console.log("App listening on port " + process.env["PORT"])
);
