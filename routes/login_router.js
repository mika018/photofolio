var express = require('express');
var router = express.Router();
var path = require('path');

var Users = require('../models/users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});
router.post('/login_request', function(req, res, next) {
  Users.loginRequest(req, res);
  res.send("Received login request");
});
router.post('/album_id_request', function(req, res, next) {
  Users.albumIdRequest(req, res);
  res.send("Received album id request");
});

module.exports = router;
