const express = require('express');
const notificationRouter = express.Router();

notificationRouter.get('/', (req, res, next) => {
  res.status(200).render('notificationsPage', {
    pageTitle: 'Notifications',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
});

module.exports = notificationRouter;
