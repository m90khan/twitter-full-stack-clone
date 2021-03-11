const express = require('express');
const userRouter = express.Router();

const User = require('../models/UserSchema');

userRouter.get('/', (req, res, next) => {
  const payload = createPayload(req.session.user);
  res.status(200).render('searchPage', payload);
});

userRouter.get('/:selectedTab', (req, res, next) => {
  const payload = createPayload(req.session.user);
  payload.selectedTab = req.params.selectedTab;
  res.status(200).render('searchPage', payload);
});

const createPayload = (userLoggedIn) => {
  return {
    pageTitle: 'Explore',
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
  };
};

module.exports = userRouter;
