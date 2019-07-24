var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var expressHBS= require('express-handlebars');
var mongoose= require('mongoose');
var paypal = require('paypal-rest-sdk');
var session= require('express-session');
var flash=require('connect-flash');
var passport=require('passport');




var routes = require('./routes/index');
var backend= require('./routes/administrador');

var app = express();

mongoose.connect('mongodb+srv://kike:kikelol1.@zapateriasur-ars9r.azure.mongodb.net/zapateria?retryWrites=true&w=majority', {useNewUrlParser: true});
//mongoose.connect('mongodb://localhost:27017/zapateria', {useNewUrlParser: true});
require('./config/passport')(passport);
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUbWRwDSZTbs3VszYrGLueAsGKqk9UL3a1i67XqmmPKI9_-EVQkN076Rk5Jszn3ru_Lbi9vQGSq8xcr-',
  'client_secret': 'EEsuv1x33eXIYqQs57Nq6bQb_BuvMqsM9Ez1QVfKLGbRxB9XKFBGgYgAGJjk6jjxXay4tx-UqxFl137y'
});

// view engine setup
app.engine('.hbs',expressHBS({defaultLayout:'layout',extname:'.hbs'}));
app.set('view engine', '.hbs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret:'estaesunaclavesecreta',resave:false,saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req,res,next){
 res.locals.login=req.isAuthenticated();
  next(); 
});

app.use('/', routes);
app.use('/administrador',backend);

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
