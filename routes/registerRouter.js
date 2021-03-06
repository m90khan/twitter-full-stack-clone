const express = require('express');
const registerRouter = express.Router();

const User = require('./../models/UserSchema');
registerRouter.get('/', (req, res, next) => {
  const payload = {
    pageTitle: 'Create Account / Nottwitter',
  };
  res.status(200).render('register', payload);
});
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  /* create and send jwt token as http cookie */
  const cookieOptions = {
    expires: new Date(
      // convert to miliseconds
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cookie cannot be accessed by browser
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);
  console.log(token);
  console.log(user);
  //remove password property from response object output
  user.password = undefined;
  //3-send token to client
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};
registerRouter.post('/', async (req, res, next) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const password = req.body.password;

  const payload = {
    pageTitle: 'Create Account / Nottwitter',
    body: req.body,
  };
  if (firstName && lastName && username && email && password) {
    try {
      const user = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });
      if (user == null) {
        // No user found
        const data = {
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          password: password,
        };
        // data.password = await bcrypt.hash(password, 10);

        const newUser = await User.create(data);
        req.session.user = newUser;
        return res.redirect('/');
      } else {
        // User found
        if (email == user.email) {
          payload.errorMessage = 'Email already in use.';
        } else {
          payload.errorMessage = 'Username already in use.';
        }
        res.status(200).render('register', payload);
      }
    } catch (error) {
      console.log(error.message);
      payload.errorMessage = 'Something went wrong.';
      res.status(200).render('register', payload);
    }
  } else {
    payload.errorMessage = 'Make sure each field has a valid value.';
    res.status(200).render('register', payload);
  }
});

module.exports = registerRouter;
