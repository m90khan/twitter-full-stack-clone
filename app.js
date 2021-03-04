const express = require('express');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', (req, res, next) => {
  const payload = {
    pageTitle: 'Main',
  };
  res.render('home', payload);
});

module.exports = app;
