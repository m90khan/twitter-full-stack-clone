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
const io = require('socket.io')(server, { pingTimeout: 60000 });

io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join room', (room) => socket.join(room));
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
  socket.on('notification received', (room) =>
    socket.in(room).emit('notification received')
  );

  socket.on('new message', (newMessage) => {
    var chat = newMessage.chat;

    if (!chat.users) return console.log('Chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
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
