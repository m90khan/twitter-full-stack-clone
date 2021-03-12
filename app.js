const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const middleware = require('./utils/middleware');
const session = require('express-session');

// app.enable('trust proxy');

// HTTP logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.json());
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
app.use('/logout', require('./routes/logoutRouter'));
app.use('/posts', middleware.requireLogin, require('./routes/postRouter'));
app.use('/profile', middleware.requireLogin, require('./routes/profileRouter'));
app.use('/uploads', require('./routes/uploadRouter'));
app.use('/search', middleware.requireLogin, require('./routes/searchRouter'));
app.use('/messages', middleware.requireLogin, require('./routes/messagesRouter'));

//API
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/chats', require('./routes/api/chats'));

app.get('/', middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: 'Home',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user), // for client
    url: req.originalUrl,
  };
  res.status(200).render('home', payload);
});

module.exports = app;

// "TT Firs Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif
