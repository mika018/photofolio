var express = require('express');
var router = express.Router();
var path = require('path');

// var Home = require('../models/explore.model');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('upload');
});
router.post('/upload_request', function(req, res, next) {
  res.send('Upload received by server!');
});

module.exports = router;
