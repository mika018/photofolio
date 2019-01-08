var express = require('express');
var router = express.Router();
var path = require('path');
var model = require('../models/model');




/* GET home page. */
router.get('/', function(req, res, next) {
  model.getEvents()
        .then(events => {
          console.log(events);
          album_names = events.map(event => event.slice(0, -1))
          res.render('home', ({
             albums_names: album_names
           }))}
        )
        .catch(err => console.log("err: " + err))
});

router.post(('/open_album'), function(req, res, next) {
  var album_name = req.body.album_name;
 
  model.getImagesByEvent(album_name)
    .then(images => {
      images.forEach((image, i) => {
          console.log(image.data)
          metadata = image.metadata[0];
          var content_type = metadata.content_type;
          // fs.writeFile("./file" + i + ".jpg", Buffer.from(image.data), (err) => console.log(err))
          // res.writeHead(200, {'Content-Type': JSON.stringify(image.met)})
      })
  })
  .catch(err => console.log(err))
  res.send("Got it")
});

module.exports = router;
