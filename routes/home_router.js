var express = require('express');
var router = express.Router();
var path = require('path');

// var Home = require('../models/explore.model');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home');
});

module.exports = router;
