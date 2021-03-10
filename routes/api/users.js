const express = require('express');
const userRouter = express.Router();
const path = require('path');
const sharp = require('sharp');

const fs = require('fs');
const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
// const Notification = require('../../models/NotificationSchema');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { Cloudinary } = require('../../utils/cloudinary');

userRouter.get('/', async (req, res, next) => {
  const searchObj = req.query;

  if (req.query.search !== undefined) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
      ],
    };
  }

  User.find(searchObj)
    .then((results) => res.status(200).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

userRouter.put('/:userId/follow', async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);

  if (user == null) return res.sendStatus(404);

  // check if followers list exists and current user is following or not
  const isFollowing = user.followers && user.followers.includes(req.session.user._id);
  // add follow ot not follow
  const option = isFollowing ? '$pull' : '$addToSet';

  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    { [option]: { following: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } }).catch(
    (error) => {
      console.log(error);
      res.sendStatus(400);
    }
  );

  //   if (!isFollowing) {
  //     await Notification.insertNotification(
  //       userId,
  //       req.session.user._id,
  //       'follow',
  //       req.session.user._id
  //     );
  //   }

  res.status(200).send(req.session.user);
});

userRouter.get('/:userId/following', async (req, res, next) => {
  User.findById(req.params.userId)
    .populate('following')
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

userRouter.get('/:userId/followers', async (req, res, next) => {
  User.findById(req.params.userId)
    .populate('followers')
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

userRouter.post(
  '/profilePicture',
  upload.single('croppedImage'),
  async (req, res, next) => {
    if (!req.file) {
      console.log('No file uploaded.');
      return res.sendStatus(400);
    }

    const filePath = `/uploads/images/profiles/${req.file.filename}.jpeg`;
    const tempPath = req.file.path;
    const targetPath = path.join(`${__dirname}`, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePic: filePath },
        { new: true }
      );
      res.sendStatus(204);
    });
  }
);

userRouter.post('/coverPhoto', upload.single('croppedImage'), async (req, res, next) => {
  if (!req.file) {
    console.log('No file uploaded with ajax request.');
    return res.sendStatus(400);
  }

  const filePath = `/uploads/images/covers/${req.file.filename}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `../../${filePath}`);

  fs.rename(tempPath, targetPath, async (error) => {
    if (error != null) {
      console.log(error);
      return res.sendStatus(400);
    }

    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      { coverPhoto: filePath },
      { new: true }
    );
    res.sendStatus(204);
  });
});

module.exports = userRouter;
