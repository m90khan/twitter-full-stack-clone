const express = require('express');
const messageRouter = express.Router();
const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
const Chat = require('../../models/ChatSchema');
const Message = require('../../models/MessageSchema');
// const Notification = require('../../models/NotificationSchema');

messageRouter.post('/', async (req, res, next) => {
  if (!req.body.content || !req.body.chatId) {
    console.log('Invalid data passed into request');
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId,
  };

  Message.create(newMessage)
    .then(async (message) => {
      message = await message.populate('sender').execPopulate(); // execPopulate : execute the populate
      message = await message.populate('chat').execPopulate();
      message = await User.populate(message, { path: 'chat.users' });

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      }).catch((error) => console.log(error));

      //   insertNotifications(chat, message);

      res.status(201).send(message);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

// function insertNotifications(chat, message) {
//   chat.users.forEach((userId) => {
//     if (userId == message.sender._id.toString()) return;

//     Notification.insertNotification(
//       userId,
//       message.sender._id,
//       'newMessage',
//       message.chat._id
//     );
//   });
// }

module.exports = messageRouter;
