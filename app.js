var express = require('express');
var expressValidator = require('express-validator');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var room = require('./routes/room');

// modules and variables for https
var fs = require('fs');
var https = require('https');
var options = {
   key  : fs.readFileSync('./ssl/key.pem'),
   cert : fs.readFileSync('./ssl/cert.pem')
};

// MongoDB
// New Code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/meezz');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
// routes with db object and util
app.use(function(req,res,next){
    req.db = db;
    // create index on roomId
    var rooms = db.get('rooms');
    rooms.index('roomId', { unique: true });
    next();
});
app.use('/room', room);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// start HTTPS server at port 443
https.createServer(options, app).listen(3100);

module.exports = app;
