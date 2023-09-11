const express = require('express');

const router = express.Router();
const OrdersController = require('../controller/ordersController');
const { requireAuth } = require('../middleware/auth');

module.exports = (app, nextMain) => {
  router.get('/orders', requireAuth, OrdersController.getOrders);
  router.get('/orders/:orderId', requireAuth, OrdersController.getOrderById);
  router.post('/orders', requireAuth, OrdersController.createOrder);
  router.patch('/orders/:orderId', requireAuth, OrdersController.updateOrder);
  router.delete('/orders/:orderId', requireAuth, OrdersController.deleteOrder);
  app.use(router);

  return nextMain();
};


