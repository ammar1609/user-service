const express = require('express');
const session = require('express-session');
require('express-async-errors');
const cors = require('cors');
const auth = require('../routes/auth.route.js');
const user = require('../routes/user.route.js');
const error = require('../middlewares/error');

module.exports = (app) => {
  app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));
  app.use(express.json());
  app.use(cors({ origin: true }));
  app.use('/user-service/auth', auth);
  app.use('/user-service/user', user);
  app.use(error);
};
