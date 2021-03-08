const express = require('express');

const postsRouter = express.Router();
const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
const { connections } = require('mongoose');

postsRouter.get('/', async (req, res, next) => {
  const searchObj = req.query;

  try {
    if (searchObj.isReply !== undefined) {
      const isReply = searchObj.isReply == 'true';
      searchObj.replyTo = { $exists: isReply };
      delete searchObj.isReply;
    }

    if (searchObj.search !== undefined) {
      searchObj.content = { $regex: searchObj.search, $options: 'i' };
      delete searchObj.search;
    }

    if (searchObj.followingOnly !== undefined) {
      const followingOnly = searchObj.followingOnly == 'true';

      if (followingOnly) {
        const objectIds = [];

        if (!req.session.user.following) {
          req.session.user.following = [];
        }

        req.session.user.following.forEach((user) => {
          objectIds.push(user);
        });

        objectIds.push(req.session.user._id);
        searchObj.postedBy = { $in: objectIds };
      }

      delete searchObj.followingOnly;
    }

    const results = await getPosts(searchObj);
    res.status(200).send(results);
  } catch (error) {
    res.status(400).send('Some Went Wrong');
  }
});
postsRouter.get('/:id', async (req, res, next) => {
  const postId = req.params.id;

  const postData = await getPosts({ _id: postId });

  const results = {
    postData: postData[0],
  };

  if (postData.replyTo !== undefined) {
    results.replyTo = postData.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId });

  res.status(200).send(results);
});
postsRouter.put('/:id/like', async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

  //$pull : remove from array ,  $addToSet : add items to any array
  const option = isLiked ? '$pull' : '$addToSet';

  // Insert user like , also update it to session for next request
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { likes: postId } },
    { new: true } // findByIdAndUpdate does not return new document hence new:true
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // Insert post like
  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // if (!isLiked) {
  //   await Notification.insertNotification(post.postedBy, userId, 'postLike', post._id);
  // }

  res.status(200).send(post);
});
postsRouter.post('/:id/retweet', async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  // Try and delete retweet
  const deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  const option = deletedPost != null ? '$pull' : '$addToSet';

  // if deletePost is null then create post
  let repost = deletedPost;

  if (repost == null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (error) => {
        console.log(error);
        res.sendStatus(400);
      }
    );
  }
  // if repost has a value
  // Insert user like
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { retweets: repost._id } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  // Insert post like
  const post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { retweetUsers: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  //   if (!deletedPost) {
  //     await Notification.insertNotification(post.postedBy, userId, 'retweet', post._id);
  //   }

  res.status(200).send(post);
});

postsRouter.post('/', async (req, res, next) => {
  if (!req.body.content) {
    console.log('Content param not sent with request');
    return res.sendStatus(400);
  }
  const postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  Post.create(postData)
    .then(async (newPost) => {
      newPost = await User.populate(newPost, { path: 'postedBy' });
      newPost = await Post.populate(newPost, { path: 'replyTo' });

      //   if (newPost.replyTo !== undefined) {
      //     await Notification.insertNotification(
      //       newPost.replyTo.postedBy,
      //       req.session.user._id,
      //       'reply',
      //       newPost._id
      //     );
      //   }

      res.status(201).send(newPost);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
postsRouter.delete('/:id', (req, res, next) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
// Update
postsRouter.put('/:id', async (req, res, next) => {
  if (req.body.pinned !== undefined) {
    await Post.updateMany({ postedBy: req.session.user }, { pinned: false }).catch(
      (error) => {
        console.log(error);
        res.sendStatus(400);
      }
    );
  }

  Post.findByIdAndUpdate(req.params.id, req.body)
    .then(() => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});
async function getPosts(filter) {
  try {
    let results = await Post.find(filter)
      .populate('postedBy')
      .populate('retweetData')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .catch((error) => console.log(error));

    results = await User.populate(results, { path: 'replyTo.postedBy' });
    results = await User.populate(results, { path: 'retweetData.postedBy' });
    return results;
  } catch (error) {
    console.log(error);
  }
}
module.exports = postsRouter;
