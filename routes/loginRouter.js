const express = require('express');
const app = express();
const User = require('./../models/UserSchema');

const loginRouter = express.Router();
// Login Page
loginRouter.get('/', (req, res, next) => {
  const payload = {
    pageTitle: 'Login on Nottwitter',
    errorMessage: null,
  };
  res.status(200).render('login', payload);
});
// Not login Home Page

loginRouter.get('/home', (req, res, next) => {
  const payload = {
    pageTitle: `Nottwitter. it's what's not happening | Nottwitter`,
    errorMessage: null,
  };
  res.status(200).render('homeNotLogged', payload);
});

loginRouter.post('/', async (req, res, next) => {
  const payload = {};
  const { logUsername, logPassword } = req.body;
  if (logUsername && logPassword) {
    try {
      const user = await User.findOne({
        $or: [{ username: logUsername }, { email: logUsername }],
      });
      if (user != null) {
        const result = await user.correctPassword(logPassword, user.password);

        if (result) {
          req.session.user = user;
          return res.redirect('/');
        } else {
          payload.errorMessage = 'Login credentials incorrect.';
          return res.status(200).render('login', payload);
        }
      }
    } catch (error) {
      console.log(error);
      payload.errorMessage = 'Something went wrong.';
      res.status(200).render('login', payload);
    }
  }

  payload.errorMessage = 'Make sure each field has a valid value.';
  res.status(200).render('login', payload);
});
module.exports = loginRouter;
