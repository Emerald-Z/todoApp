// Backend Routes that handle file upload and downloads
// Google API Documentation: https://cloud.google.com/nodejs/docs/reference/storage/latest

const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bucket = require("./firebase/cred.js").bucket;
const cors = require("cors");

// Route Handler
const files = express.Router();
files.use(cors());

// Download file from bucket
files.get("/get_files/:file_name", async (req, res) => {
  try {
    // Specify where to download the file to
    const file_name = req.params.file_name;
    const file_location = path.join(__dirname, "../files", file_name);
    const downloadOption = {
      destination: file_location,
    };
    // Checks if the file exists on the server, retrieves from bucket if it doesn't
    if (!fs.existsSync(file_location)) {
      // Downloads the File from the bucket, throws an exception if it doesn't exist
      await bucket.file(file_name).download(downloadOption);
    }
    // Return the file
    console.log(file_location)
    return res.status(200).sendFile(file_location);
  } catch (e) {
    console.log(e)
    return res.status(404).send("No such file exists");
  }
});

files.delete("/delete/", async(req, res) => {
  const body = req.body;
  console.log(body);

  if(body.file_name == undefined) {
    return res.json({
      msg: "Error: file not defined in request",
      data: {},
    });
  }

  const file_name = body.file_name;

  await bucket.file(file_name).delete();
  return res.status(200).json("success", file_name);
})

// Upload File via Memory: https://github.com/googleapis/nodejs-storage/blob/main/samples/uploadFromMemory.js
//pass in username
files.post("/", multer().single("demo_image"), async (req, res) => {
  const file = req.file;
  console.log(file)
  if (file !== undefined) {
    // Upload via buffers
    await bucket.file(req.file.originalname).save(req.file.buffer);
    return res.status(201).json({ msg: "Successful Uploaded", name: file.originalname });
  }
  return res.status(400).json({ msg: "File could not be loaded" });
});

// Upload File from Disk: https://github.com/googleapis/nodejs-storage/blob/main/samples/uploadFile.js
files.post("/disk", multer().single("demo_image"), async (req, res) => {
  const file = req.file;

  if (file !== undefined) {
    // First download the file to disk: make sure you have a /files_demo/files directory
    const file_location = path.join(__dirname, "../files", file.originalname);
    fs.writeFileSync(file_location, file.buffer);

    // Then upload the file: file_location is where the file is locally
    const options = { destination: file.originalname };
    await bucket.upload(file_location, options);
    return res.status(201).json({ msg: "Successful Uploaded" });
  }
  return res.status(400).json({ msg: "File could not be loaded" });
});

module.exports = files;
