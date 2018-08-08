
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var beats = [
  {id:1, name: "Stanky", producer: "MetroBoomin", image:"https://www.recordingconnection.com/wp-content/uploads/howtos/console.jpg", upvotes:754},
  {id:2, name: "Clippa", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:523},
  {id:3, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
  {id:4, name: "layback", producer: "JID", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:213},
  {id:5, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
  {id:6, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
  {id:7, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
  {id:8, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224},
  {id:9, name: "Dread", producer: "ThenisLime", image:"https://cdn.careersinmusic.com/wp-content/uploads/2015/05/Fotolia_74653861_S_copyright.jpg", upvotes:224}
  ];
  
    
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/main", function(req, res) {
    res.render("main", {beats: beats});
});

app.post("/main", function(req, res) {
   var id = 99;
   var name = req.body.name;
   var producer = req.body.producer;
   var image = req.body.image;
   var upvotes = 0;
   var newBeat = {id:id, name: name, producer: producer,image: image, upvotes: upvotes};
   beats.push(newBeat);
   
   // redirect
   res.redirect("/main");
});

app.get("/main/new", function(req, res) {
    res.render("new");
})

// Here do the GET of beats. * Need to be beat id specific. Udemycourse explains this.
// app.get("/") {

// }


app.listen(process.env.PORT || 4000, process.env.IP, function() {
    console.log("RapRank server has started locally on 4000...");
});














