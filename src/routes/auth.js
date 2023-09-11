const express = require('express');

const router = express.Router();
const AuthController = require('../controller/authController');

module.exports = (app, nextMain) => {
  router.post('/auth', AuthController.postAuth);
  app.use(router);

  return nextMain();
};