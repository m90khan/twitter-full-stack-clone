const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name.'],
      trim: true,
      maxlength: [50, 'First Name cannot be more than 50 characters'],
      minlength: [2, 'First Name cannot be less than 3 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name.'],
      trim: true,
      maxlength: [50, 'Last Name cannot be more than 50 characters'],
      minlength: [2, 'Last Name cannot be less than 3 characters'],
    },
    username: {
      type: String,
      required: [true, 'Please provide user name.'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email address.'],
      trim: true,
      unique: [true, 'This email address is already exists'],
      validate: [validator.isEmail, 'Please provide a valid email address'],
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, 'Description cannot be more than 250 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [25, 'location cannot be more than 25 characters'],
    },
    password: {
      type: String,
      required: [true, 'Please provide valid password.'],
      minlength: [6, 'Password must be equal or greater than 8 characters'],
    },
    profilePic: { type: String, default: '/images/profilePic.jpeg' },
    coverPhoto: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// hashing the password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
/* Instance method to compare passwords */
UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', UserSchema);
module.exports = User;
