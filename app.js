var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
// var redis   = require("redis");
// var redisStore = require('connect-redis')(session);
var home_router = require('./routes/home_router');
var upload_router = require('./routes/upload_router');
var login_router = require('./routes/login_router');
var gallery_router = require('./routes/gallery_router');
// var client  = redis.createClient();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({ cookieName: 'session',
                  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
                  maxAge: null,
                  httpOnly: true,
                  secure: true,
                  ephemeral: true,
                  saveUninitialized: true,
                  resave: true
                }));
app.use(function(req,res,next){
  console.log(req.session);
  next();
})
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', login_router);
app.use('/', home_router);
app.use('/gallery', gallery_router);
app.use('/upload', upload_router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
