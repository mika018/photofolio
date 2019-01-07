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
  res.render('upload');
});

router.post('/upload_request',   function(req, res, next) {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    console.log(files)
    console.log(fields)
    var oldpath = files['uploads[]']['path'];

    var file = fs.readFileSync(oldpath);
    var content_type =  files['uploads[]']['type'].substr(files['uploads[]']['type'].lastIndexOf('/') + 1);
    var metadata = {
      filename : files['uploads[]']['name'],
      content_type : content_type,
      eventt : fields['album_name']
    }
    console.log(metadata)



    // model.uploadImage(file, metadata)
    model.uploadImage(file, metadata)
          .then(data => console.log(data))
          .catch(err => console.log(err))
          .then(() => model.updateImageMetaData(metadata, metadata))
          .then(data => console.log(data))
          .catch(err => console.log(err))
    res.send('Upload received by server!');
  });
});

// var upload = multer({
//   storage: s3({
//       dirname: '/',
//       bucket: 'bucket-name',
//       secretAccessKey: 'TFnLnZlUzqcUupBnDqnNLY6Mjf5IFGMSE3khDJgs',
//       accessKeyId: 'AKIAIKZDBQWF7HPPD4TQ',
//       region: 'us-east-1',
//       filename: function (req, file, cb) {
//           cb(null, file.originalname); //use Date.now() for unique file keys
//       }
//   })
// });
module.exports = router;
