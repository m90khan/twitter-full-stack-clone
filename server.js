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
