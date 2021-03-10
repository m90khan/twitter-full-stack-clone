const express = require('express');
const uploadRouter = express.Router();

const path = require('path');

uploadRouter.get('/images/profiles/:path', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../uploads/images/profiles/' + req.params.path));
});
uploadRouter.get('/images/covers/:path', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../uploads/images/covers/' + req.params.path));
});

module.exports = uploadRouter;
