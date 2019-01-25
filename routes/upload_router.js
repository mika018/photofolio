var express = require('express');
var router = express.Router();
var path = require('path');
var formidable = require('formidable');
var model = require('../models/model');
const fs = require('fs');

// var parser = require('exif-parser').create(buffer);
// var result = parser.parse();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.user){
    res.render('upload');
  }
  else{
    res.redirect('/login');
  }
});

router.post('/upload_request',   function(req, res, next) {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    console.log(files)
    console.log(fields)
    var oldpath = files['uploads[]']['path'];
    console.log(req.session.user);
    var file = fs.readFileSync(oldpath);
    var content_type =  files['uploads[]']['type'].substr(files['uploads[]']['type'].lastIndexOf('/') + 1);
    var metadata = {
      filename : files['uploads[]']['name'],
      content_type : content_type,
      eventt : fields['album_name'],
      user_name : req.session.user
    }
    console.log(metadata)

    // model.uploadImage(file, metadata)
    model.addEvent( metadata.user_name, metadata.eventt)
    .then(() => {
      model.uploadImage(file, metadata)
      .then(data => console.log(data))
      .catch(err => console.log(err))
      .then(() => { 
        res.send('Upload received by server!');
      })
    })          
  });
});

module.exports = router;
