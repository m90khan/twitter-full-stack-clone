const express = require('express');
const messagesRouter = express.Router();
const mongoose = require('mongoose');
const User = require('../models/UserSchema');
const Chat = require('../models/ChatSchema');

messagesRouter.get('/', (req, res, next) => {
  res.status(200).render('inboxPage', {
    pageTitle: 'Messages',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
});
// new message page
messagesRouter.get('/new', (req, res, next) => {
  res.status(200).render('newMessage', {
    pageTitle: 'New message',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
});
//chat page
messagesRouter.get('/:chatId', async (req, res, next) => {
  const userId = req.session.user._id;
  const chatId = req.params.chatId;
  const isValidId = mongoose.isValidObjectId(chatId); // check is chatId is valid Object Id

  const payload = {
    pageTitle: 'Chat',
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  if (!isValidId) {
    payload.errorMessage =
      'Chat does not exist or you do not have permission to view it.';
    return res.status(200).render('chatPage', payload);
  }

  let chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate('users');

  if (chat == null) {
    // Check if chat id is really user id
    const userFound = await User.findById(chatId);

    if (userFound != null) {
      // get chat using user id
      chat = await getChatByUserId(userFound._id, userId);
    }
  }

  if (chat == null) {
    payload.errorMessage =
      'Chat does not exist or you do not have permission to view it.';
  } else {
    payload.chat = chat;
  }

  res.status(200).render('chatPage', payload);
});

function getChatByUserId(userLoggedInId, otherUserId) {
  return Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
      },
    },
    {
      $setOnInsert: {
        users: [userLoggedInId, otherUserId],
      },
    },
    {
      new: true,
      upsert: true,
    }
  ).populate('users');
}

module.exports = messagesRouter;
