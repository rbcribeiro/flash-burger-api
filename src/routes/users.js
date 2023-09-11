const express = require('express');

const router = express.Router();
const UsersController = require('../controller/usersController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

module.exports = (app, nextMain) => {
  router.get('/users', requireAdmin, UsersController.getUsers);
  router.get('/users/:uid', requireAuth, UsersController.getUserById);
  router.post('/users', requireAdmin, UsersController.createUser);
  router.patch('/users/:uid', requireAdmin, UsersController.updateUser);
  router.delete('/users/:uid', requireAdmin, UsersController.deleteUser);
  app.use(router);

  return nextMain();
};
