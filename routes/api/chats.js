const express = require('express');
const chatRouter = express.Router();
const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
const Chat = require('../../models/ChatSchema');
const Message = require('../../models/MessageSchema');

chatRouter.post('/', async (req, res, next) => {
  if (!req.body.users) {
    console.log('Users param not sent with request');
    return res.sendStatus(400);
  }

  const users = JSON.parse(req.body.users);

  if (users.length == 0) {
    console.log('Users array is empty');
    return res.sendStatus(400);
  }

  users.push(req.session.user);

  const chatData = {
    users: users,
    isGroupChat: true,
  };
  Chat.create(chatData)
    .then((results) => res.status(200).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

chatRouter.get('/', async (req, res, next) => {
  //$elemMatch : macthed item in an array
  Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
    .populate('users')
    .populate('latestMessage')
    .sort({ updatedAt: -1 }) // sort by  descending order
    .then(async (results) => {
      if (req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true') {
        results = results.filter(
          (r) => r.latestMessage && !r.latestMessage.readBy.includes(req.session.user._id)
        );
      }
      results = await User.populate(results, { path: 'latestMessage.sender' });
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// GET chat name and populate users
chatRouter.get('/:chatId', async (req, res, next) => {
  //findOne instead of find : to only get one element and NOT in form of  ARRAY
  Chat.findOne({
    _id: req.params.chatId,
    users: { $elemMatch: { $eq: req.session.user._id } },
  })
    .populate('users')
    .then((results) => res.status(200).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// Update chat id
chatRouter.put('/:chatId', async (req, res, next) => {
  Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .then((results) => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// Get chat messages
chatRouter.get('/:chatId/messages', async (req, res, next) => {
  Message.find({ chat: req.params.chatId })
    .populate('sender')
    .then((results) => res.status(200).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// Update message as read
chatRouter.put('/:chatId/messages/markAsRead', async (req, res, next) => {
  Message.updateMany(
    { chat: req.params.chatId },
    { $addToSet: { readBy: req.session.user._id } }
  )
    .then(() => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

module.exports = chatRouter;
