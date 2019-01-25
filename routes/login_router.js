var express = require('express');
var router = express.Router();
var path = require('path');
var model = require('../models/model');
var Users = require('../models/users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.post('/login_request', function(req, res, next) {
  model.verifyUser(req, res);
});

router.post('/album_id_request', function(req, res, next) {
  var album_name = req.body.album_name;
 
  model.getImagesByEvent(album_name)
    .then(images => {
      image_list = []
      images.forEach((image, i) => {
          console.log(image.data)
          metadata = image.metadata[0];
          data = image.data; //new Buffer(encodedImage, 'base64').toString('binary');
          // var img = fs.readFileSync('')
          var content_type = metadata.content_type;
          // fs.writeFile("./file" + i + ".jpg", Buffer.from(image.data), (err) => console.log(err))
          // res.setHead({'Content-Type': content_type})
          // res.end(data, 'binary')
          image_list.push({metadata: metadata, data: data.toString('base64')})
          // res.send(data.toString('base64'))
      })
      res.send(image_list)
  })
  .catch(err => console.log(err))
});

module.exports = router;
