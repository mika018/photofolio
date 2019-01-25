var express = require('express');
var router = express.Router();
var path = require('path');
var model = require('../models/model');




/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.user){
    model.getEvents()
      .then(events => {
        console.log(events);
        album_names = events.map(event => event.slice(0, -1))
        res.render('home', ({
          albums_names: album_names
        }))}
      )
      .catch(err => console.log("err: " + err))
  }
  else {
    res.redirect('/login')
  }

});



module.exports = router;
