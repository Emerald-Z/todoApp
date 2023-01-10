
var admin = require("firebase-admin");

var serviceAccount = require("./cred.json");
var { getStorage } = require("firebase-admin/storage");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://todotpeo.appspot.com"
});

const bucket = getStorage().bucket();
const firestore = admin.firestore();
module.exports = {firestore, bucket};