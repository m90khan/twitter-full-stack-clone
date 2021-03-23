const express = require('express');
const notificationRouter = express.Router();

const Notification = require('../../models/NotificationSchema');

notificationRouter.get('/', async (req, res, next) => {
  const searchObj = {
    userTo: req.session.user._id,
    notificationType: { $ne: 'newMessage' },
  };

  // if query ? only search unopened
  if (req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true') {
    searchObj.opened = false;
  }
  Notification.find(searchObj)
    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 })
    .then((results) => res.status(200).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// get lastest notification
notificationRouter.get('/latest', async (req, res, next) => {
  Notification.findOne({ userTo: req.session.user._id })
    .populate('userTo')
    .populate('userFrom')
    .sort({ createdAt: -1 })
    .then((results) => res.status(200).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// Marked single as opened
notificationRouter.put('/:id/markAsOpened', async (req, res, next) => {
  Notification.findByIdAndUpdate(req.params.id, { opened: true })
    .then(() => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// marked all opened
notificationRouter.put('/markAsOpened', async (req, res, next) => {
  Notification.updateMany({ userTo: req.session.user._id }, { opened: true })
    .then(() => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

module.exports = notificationRouter;
