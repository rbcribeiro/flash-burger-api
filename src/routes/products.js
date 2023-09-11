const express = require('express');

const router = express.Router();
const ProductsController = require('../controller/productsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

module.exports = (app, nextMain) => {
  router.get('/products', requireAdmin, ProductsController.getProducts);
  router.get('/products/:productId', requireAuth, ProductsController.getProductById);
  router.post('/products', requireAdmin, ProductsController.createProduct);
  router.patch('/products/:productId', requireAdmin, ProductsController.updateProduct);
  router.delete('/products/:productId', requireAdmin, ProductsController.deleteProduct);
  app.use(router);

  return nextMain();
};
