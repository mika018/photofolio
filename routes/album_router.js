var express = require('express');
var router = express.Router();
var formidable = require('formidable');

/* GET album page. */
router.get('/:albumid', function(req, res, next) {
  if (req.params.albumid) {
    res.render('album', { album: req.params.albumid });
  } else {
    res.render('error');
  }
});

router.post('/find_me', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    
    console.log(fields)
    // model.uploadImage(files, files)
    res.send('Upload received by server!');
  });
});

module.exports = router;
