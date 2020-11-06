/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Busboy = require("busboy");
const inspect = require("util").inspect;
const cors = require("cors");
require("dotenv").config();

// config
const app = express();
const port = 3000;
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// config firebase
admin.initializeApp({
  credential: admin.credential.cert({
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL
  }),
  storageBucket: "gs://quasagram-9ad28.appspot.com"
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

// GET posts
app.get("/posts", (req, res) => {
  console.log("GET /posts");
  let posts = [];
  db.collection("posts")
    .orderBy("date", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        posts.push(doc.data());
      });
      res.send(posts);
    });
});

// POST post
app.post("/posts", (request, response) => {
  console.log("POST /posts");
  const uuid = uuidv4();

  const busboy = new Busboy({ headers: request.headers });

  let fields = {};
  let fileData = {};

  busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
    console.log(
      "File [" +
        fieldname +
        "]: filename: " +
        filename +
        ", encoding: " +
        encoding +
        ", mimetype: " +
        mimetype
    );
    // /tmp/4564564-234234.png
    let filepath = path.join(os.tmpdir(), filename);
    file.pipe(fs.createWriteStream(filepath));
    fileData = { filepath, mimetype };
  });

  busboy.on("field", function(
    fieldname,
    val,
    fieldnameTruncated,
    valTruncated,
    encoding,
    mimetype
  ) {
    fields[fieldname] = val;
  });

  busboy.on("finish", function() {
    bucket.upload(
      fileData.filepath,
      {
        uploadType: "media",
        metadata: {
          metadata: {
            contentType: fileData.mimetype,
            firebaseStorageDownloadTokens: uuid
          }
        }
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile);
        }
      }
    );

    function createDocument(uploadedFile) {
      db.collection("posts")
        .doc(fields.id)
        .set({
          id: fields.id,
          caption: fields.caption,
          location: fields.location,
          date: parseInt(fields.date),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
        })
        .then(() => {
          response.send("Post added: " + fields.id);
        });
    }
  });

  request.pipe(busboy);
});

// DELETE post
app.delete("/posts/:id", (req, res) => {
  console.log("DELETE post " + req.params.id);
  // delete image from storage
  bucket
    .file(req.params.id + ".png")
    .delete()
    .then(() => {
      // delete post from db
      console.log("delete from db");
      db.collection("posts")
        .doc(req.params.id)
        .delete()
        .then(() => {
          console.log("send 200");
          res.status(200).send();
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.send(err);
    });
});

app.get("/", (req, res) => {
  console.log("serving GET /");
  res.send("Sent with <3 from node.js");
});

// listen
app.listen(process.env.PORT || port, () => {
  console.log(`listening at http://localhost:${port}`);
});
