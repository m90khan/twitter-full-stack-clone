const express = require('express');
const profileRouter = express.Router();

const User = require('../models/UserSchema');

profileRouter.get('/', (req, res, next) => {
  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };

  res.status(200).render('profilePage', payload);
});

profileRouter.get('/:username', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);

  res.status(200).render('profilePage', payload);
});

profileRouter.get('/:username/replies', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = 'replies';

  res.status(200).render('profilePage', payload);
});

profileRouter.get('/:username/following', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = 'following';

  res.status(200).render('followersAndFollowing', payload);
});

profileRouter.get('/:username/followers', async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = 'followers';

  res.status(200).render('followersAndFollowing', payload);
});

async function getPayload(username, userLoggedIn) {
  let user = await User.findOne({ username: username });

  if (user == null) {
    user = await User.findById(username);

    if (user == null) {
      return {
        pageTitle: 'User not found',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.username,
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
}

module.exports = profileRouter;
