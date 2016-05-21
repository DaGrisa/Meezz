var express = require('express');
var expressValidator = require('express-validator');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var room = require('./routes/room');

// modules and variables for https
var fs = require('fs');
var constants = require('constants');
var https = require('https');
var options = {
  // POODLE Attack Protection
  secureProtocol: 'SSLv23_method',
  secureOptions: constants.SSL_OP_NO_SSLv3,
  key  : fs.readFileSync('./ssl/key.pem'),
  cert : fs.readFileSync('./ssl/cert.pem')
};

// MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/meezz');

// helmet for secure http headers
var helmet = require('helmet');

var app = express();

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

// provide and cache static files
var oneDay = 86400000;
app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneDay }));

app.use('/', routes);
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
