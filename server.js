const dotenv = require('dotenv');
dotenv.config();
/* Uncaught exceptions errors */
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception: shuting down');
  // 0 = success , 1 = uncalled exception
  process.exit(1);
});

const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const app = require('./app');

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`DB connected: listening port: ${port}`);
  });
const server = app.listen(port);
//instantiate the socket
const io = require('socket.io')(server, { pingTimeout: 60000 });
/*
Socket.io:  for real time messages/responses
- instantiate the socket
- register the event to instant like connected
- once socket/client is connected to the front side(whenever a user logged in).
- then we can setup event listeners and emit events to those listeners
*/
// on connection to socket
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    /* join listener/chatroom with user.id , 
    then emit an event to teh listner so that receives it by everyone who joined it
    every logged in user joined the room with thri user Id. so if anything needs 
    to be sent to the user, simply send to the room  */
    socket.join(userData._id);
    socket.emit('connected');
  });
  socket.on('join room', (room) => socket.join(room));
  // send event to room
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
  // socket.on('notification received', (room) =>
  //   socket.in(room).emit('notification received')
  // );
  socket.on('new message', (newMessage) => {
    const chat = newMessage.chat;
    if (!chat.users) return console.log('Chat.users not defined');
    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return; // not to send message to self
      socket.in(user._id).emit('message received', newMessage);
    });
  });
});
/* Unhandled rejections globally: errors that happens outside express */
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection: shuting down');
  server.close(() => {
    process.exit(1); // 0 = success , 1 = uncalled expection
  });
});

/* Heroku sigterm signal  */
//   process.on('SIGTERM', () => {
//     console.log('Sigterm received, shuting down');
//     server.close(() => {
//       console.log('process closed');
//     });
//   });
