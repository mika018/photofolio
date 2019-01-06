var express = require('express');
var router = express.Router();
var path = require('path');

/* GET album page. */
router.get('/:albumid', function(req, res, next) {
  if (req.params.albumid) {
    res.render('album', { album: req.params.albumid });
  } else {
    res.render('error');
  }
});

module.exports = router;
