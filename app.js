
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/rap_rank",{ useNewUrlParser: true });
  
    
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


// SCHEMA SETUP
var renditionSchema = new mongoose.Schema({
  artist: String,
    url: String,
    rank: Number
});

var Rendition = mongoose.model("Rendition", renditionSchema);

var beatSchema = new mongoose.Schema({
  id: Number,
  name: String,
  producer: String,
  image: String,
  upvotes: Number,
  renditions: [{
    artist: String,
    url: String,
    rank: Number
  }],
  source: String, // music streaming url (soundcloud?)
  meta: {
    upvotes: Number,
    favs: Number
  },
  comments: [{body: String, date: Date}]

});

var Beat = mongoose.model("Beat", beatSchema);

// Beat.create(
//     {
//         id:1, 
//         name: "Stanky", 
//         producer: "MetroBoomin", 
//         image:"https://www.recordingconnection.com/wp-content/uploads/howtos/console.jpg", 
//         upvotes:754
//     }, function(err, beat) {
//         if (err) {
//             console.log(err);
//         } else {
//           console.log("NEWLY CREATED BEAT: ");
//           console.log(beat);
//         }
//     }
//   );



// var beats = [
//   {id:1, name: "Stanky", producer: "MetroBoomin", image:"https://www.recordingconnection.com/wp-content/uploads/howtos/console.jpg", upvotes:754},
//   {id:2, name: "Clippa", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:523},
//   {id:3, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
//   {id:4, name: "layback", producer: "JID", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:213},
//   {id:5, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
//   {id:6, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
//   {id:7, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
//   {id:8, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
//   {id:9, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224}
//   ];


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



    // Beat.findById(req.body.id, function(err, foundBeat) {
    //   if (err) {
    //     console.log("ERROR: cannot upload new rendition");
    //     console.log(err);
    //   } else {
        
    //     foundBeat.renditions.push({artist:artist,url:source,rank:rank});
    //     console.log(foundBeat.renditions);
    //     // Rendition.create(newRendition, function(err, newlyCreatedRendition) {
    //     //   if (err) {
    //     //     console.log(err);
    //     //   } else {
    //     //     console.log(foundBeat.renditions);
    //     //     foundBeat.renditions.push(newlyCreatedRendition);
    //     //     res.redirect("/main/" + req.body.id);

    //     //   }
    //     // });

    //     // foundBeat.renditions.push(newRendition);
    //     // console.log("POST NEW RENDITION WORKS!");
    //     // console.log(foundBeat);
    //     // console.log(req.params.id);
    //     // res.redirect("/main/" + req.body.id);
    //   }
    // }); 
});

// "New" page for uploading the new rendition
app.get("/main/:id/new", function(req,res) {
  res.render("newRendition");
});

// "New" page for uploading new beat
app.get("/main/new", function(req, res) {
    res.render("new");
});


// SHOW - shows more info about one beat
app.get("/main/:id", function(req, res) {
  // find beat with provided ID
  Beat.findById(req.params.id, function(err, foundBeat) {
    if (err) {
      console.log(err);
    } else {
      console.log("TEST");
      console.log(foundBeat.renditions[0].artist);
      res.render("show", {beat: foundBeat});
    }
  });
});


app.listen(process.env.PORT || 4000, process.env.IP, function() {
    console.log("RapRank server has started locally on 4000...");
});














