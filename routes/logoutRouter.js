const express = require('express');
const logoutRouter = express.Router();

logoutRouter.get('/', (req, res, next) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
});

module.exports = logoutRouter;
