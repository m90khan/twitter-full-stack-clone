const express = require('express');

const bookmarkRouter = express.Router();

bookmarkRouter.get('/', (req, res, next) => {
  const payload = {
    pageTitle: 'Bookmarks',
    errorMessage: null,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render('bookmarkPage', payload);
});

module.exports = bookmarkRouter;
