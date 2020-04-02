require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const session = require('express-session');
const MongoStore   = require('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const ensureLogin = require('connect-ensure-login');

// User model
const User           = require("./models/user");


mongoose
  .connect('mongodb://localhost/lab-express-basic-auth', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(session({
//   secret: 'basic-auth-secret',
//   cookie: { maxAge: 60000000 },
//   store: new MongoStore({
//     mongooseConnection: mongoose.connection,
//     ttl: 24 * 60 * 60, // 1 day
//   }),
// }));

//Initializing Passport

app.use(
  session({
    secret: 'our-passport-local-strategy-app',
    resave: true,
    saveUninitialized: true
  })
);

passport.serializeUser((user, callback) => {
  callback(null, user._id);
});

passport.deserializeUser((id, callback) => {
  User.findById(id)
    .then(user => {
      callback(null, user);
    })
    .catch(error => {
      callback(error);
    });
});

passport.use(
  new LocalStrategy((username, password, callback) => {
    User.findOne({ username })
      .then(user => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
          return callback(null, false, { message: 'Incorrect username or password' });
        }
        callback(null, user);
      })
      .catch(error => {
        callback(error);
      });
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';



const index = require('./routes/index');
app.use('/', index);

// // private route middleware
// app.use((req, res, next) => {
//   if (req.session.loggedUser) {
//     next();
//     return;
//   }

//   res.redirect('/login');
// });

const secret = require('./routes/secret');
app.use('/', secret);

app.get('/secret', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('secret', { user: req.user });
});

module.exports = app;
