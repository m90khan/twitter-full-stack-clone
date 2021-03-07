const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Post = require('./models/PostSchema');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`DB connected`);
  });

const deleteData = async () => {
  try {
    await Post.deleteMany();
    console.log('Data deleted Successfully');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
