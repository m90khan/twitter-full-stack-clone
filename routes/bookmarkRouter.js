const express = require('express');

const bookmarkRouter = express.Router();

bookmarkRouter.get('/', (req, res, next) => {
  const payload = {
    pageTitle: 'Bookmarks',
    errorMessage: null,
  };
  res.status(200).render('bookmarkPage', payload);
});

module.exports = bookmarkRouter;
