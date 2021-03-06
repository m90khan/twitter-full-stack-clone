const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const middleware = require('./middleware');
const session = require('express-session');

// app.enable('trust proxy');

// HTTP logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// set session
app.use(
  session({
    secret: process.env.SESSION_TOKEN,
    resave: true,
    saveUninitialized: false,
  })
);
// Routes
app.use('/login', require('./routes/loginRouter'));
app.use('/register', require('./routes/registerRouter'));
app.get('/', middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: 'Home',
  };

  res.render(200).render('home', payload);
});

module.exports = app;