var express = require('express');
var router = express.Router();
var path = require('path');
var model = require('../models/model');


router.use('/', function(req, res, next){

    res.render('gallery');
})

module.exports = router;
