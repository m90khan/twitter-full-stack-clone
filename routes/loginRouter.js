const express = require('express');
const app = express();
const User = require('./../models/UserSchema');

const loginRouter = express.Router();
// app.set('view engine', 'pug');
// app.set('views', 'views');
// app.use(express.urlencoded({ extended: false }));

loginRouter.get('/', (req, res, next) => {
  const payload = {
    pageTitle: 'Login on Nottwitter / Nottwitter',
    errorMessage: null,
  };
  res.status(200).render('login', payload);
});
loginRouter.post('/', async (req, res, next) => {
  const payload = {};
  const { logUsername, logPassword } = req.body;
  console.log(req.body);
  if (logUsername && logPassword) {
    try {
      const user = await User.findOne({
        $or: [{ username: logUsername }, { email: logUsername }],
      });
      if (user != null) {
        const result = await user.correctPassword(logPassword, user.password);

        if (result === true) {
          // req.session.user = user;
          console.log('yes');
          return res.redirect('/');
        }
      }
    } catch (error) {
      console.log(error);
      payload.errorMessage = 'Something went wrong.';
      res.status(200).render('login', payload);
    }
  } else {
    payload.errorMessage = 'Login credentials incorrect.';
    return res.status(200).render('login', payload);
  }

  payload.errorMessage = 'Make sure each field has a valid value.';
  res.status(200).render('login');
});
module.exports = loginRouter;
