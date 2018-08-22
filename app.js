
// Module dependencies


var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// Connect to Mongo Database
mongoose.connect("mongodb://localhost:27017/rap_rank",{ useNewUrlParser: true });
var conn = mongoose.connection;
var path = require('path');
// require GridFS
var Grid = require('gridfs-stream');
var fs = require('fs');
var mediaserver = require('mediaserver');


// Include p5 library




// Connect GridFS with Mongo
Grid.mongo = mongoose.mongo;

var storeOrRetrieve = 1; // store = 0, retrieve = 1
// RetrieveFromDB("oldtune.mp3");

// Upload to db
function UploadToDB(fname) {
  // where to find video in the filesystem that we will store in DB
  var musicPath = path.join(__dirname, 'readFrom/' + fname);
  conn.once('open', function() {
    console.log("-Connection open-");
    var gfs = Grid(conn.db);
    // Will be stored in Mongo as whatever name you specify here.
    var writestream = gfs.createWriteStream({
      filename: fname
    });
    // create a read-stream from where the video currently is (musicPath)
    // and pipe it into the database (through write-stream)
    fs.createReadStream(musicPath).pipe(writestream);

    writestream.on('close', function(file) {
      // Do something with file
      console.log(file.filename + " written to DB Successfully!");
    });
  });
}

// Download from db
function RetrieveFromDB(fname) {
  conn.once('open', function() {
    console.log("-Connection open-");
    var gfs = Grid(conn.db);
    var fs_write_stream = fs.createWriteStream(path.join(__dirname, 'writeTo/' + fname));
    var readstream = gfs.createReadStream({
      filename: fname
    });
    readstream.pipe(fs_write_stream);
    fs_write_stream.on('close', function() {
      console.log("File retrieved from DB successfully!");
    });
  });    
}

// Producer ID
function getNextPID() {

}

// Rapper ID
function getNextRID() {

}

// Beat ID
function getNextBID() {

}

// Rendition ID
function getNextRenID() {

}

// Comment ID
function getNextCID() {

}
  
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


// User Schema Set Up
var userSchema = new mongoose.Schema({
  UserID: Number, // Maybe use this ID to store as PID or RID?
  firstName: String,
  lastName: String,
  email: String,
  age: Number
});


// Producer Schema Set up
var producerSchema = new mongoose.Schema({
  PID: Number,
  P_Name: String,
  beatIDs: [Number]
});

// Beat Schema Set up
var beatSchema = new mongoose.Schema({
  BID: Number,
  PID: Number,
  beat_name: String,
  image_url : String,
  upvotes: Number,
  favs: Number,
  commentIDs: [Number]
});

// Comment Schema Set up
var commentSchema = new mongoose.Schema({
  CID: Number,
  SID: Number, // Id of the beat or the rendition
  userID: Number,
  text: String,
  date: Date
});

// Rendition Schema Set up
var renditionSchema = new mongoose.Schema({
  RenID: Number, // Rendition unique ID: use this for name for storing into GridFS
  BID: Number,
  RID: Number, // Rapper ID
  R_name: String, // Rapper name
  B_name: String // Beat name
});



var Rendition = mongoose.model("Rendition", renditionSchema);
var Beat = mongoose.model("Beat", beatSchema);

// Landing Route
app.get("/", function(req, res) {
    res.render("landing");
});

// RapRank Main page
app.get("/main", function(req, res) {
  Beat.find({}, function(err, allBeats) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {beats: allBeats});
    }
  });
});

// Post to main (Upload new beat)
app.post("/main", function(req, res) {
   var id = 99;
   var name = req.body.name;
   var producer = req.body.producer;
   var image = req.body.image;
   var source = req.body.source;

   var upvotes = 0;
   var favs = 0;
   var meta = {upvotes,favs};

   var newBeat = {id:id, name: name, producer: producer,image: image, meta: meta, source: source};
   // beats.push(newBeat);

   // Create new beat and save to DB
   Beat.create(newBeat, function(err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        // redirect
       res.redirect("/main");
      }
   });
});


/** Implementing Simple Music Server using Express JS **/
// app.get('/music', function(req,res){
//   // File to be served
//   var fileId = req.query.id; 
//   var file = __dirname + '/music/' + fileId;
//   fs.exists(file,function(exists){
//     if(exists)
//     {
//       var rstream = fs.createReadStream(file);
//       rstream.pipe(res);
//     }
//     else
//     {
//       res.send("Its a 404");
//       res.end();
//     }
//   });
// });
app.get('/music', function(req,res){
  // File to be served
  var fileId = req.query.id; 
  var file = __dirname + '/music/' + fileId;
  fs.exists(file,function(exists){
    if(exists)
    {
      // var rstream = fs.createReadStream(file);
      // rstream.pipe(res);
      mediaserver.pipe(req,res,file);
    }
    else
    {
      res.send("Its a 404");
      res.end();
    }
  });
});


// POST to /main/:id (Upload own rendition)
app.post("/rendition", function(req, res) {

    var artist = req.body.artist;
    var source = req.body.source;
    var rank = 200;

    var newRendition = {artist:artist,url:source,rank:rank};
    
    Beat.findByIdAndUpdate(req.body.id,
        {$push: {renditions: newRendition}},
        {safe: true, upsert: true},
        function(err, doc) {
            if(err){
              console.log(err);
            }else{
            //do stuff
            // console.log(doc.renditions);
            console.log(doc);

              res.redirect("/main/" + req.body.id);
            }
        }
    );

});

// "New" page for uploading the new rendition
app.get("/main/:id/new", function(req,res) {
  res.render("newRendition");
});

// "New" page for uploading new beat
app.get("/main/new", function(req, res) {
    res.render("new");
});


// Go to SHOW page (more info about a beat)
app.get("/main/:id", function(req, res) {
  // find beat with provided ID
  Beat.findById(req.params.id, function(err, foundBeat) {
    if (err) {
      console.log(err);
    } else {
      res.render("show", {beat: foundBeat});
    }
  });
});


app.listen(process.env.PORT || 4000, process.env.IP, function() {
    console.log("RapRank server has started locally on 4000...");
});














