const auth = require('./auth');
const users = require('./users');
const products = require('./products');
const orders = require('./orders');

const root = (app, next) => {
  const pkg = app.get('pkg');
  
  app.get('/', (req, res) => {
    console.log('Received GET request to /');
    res.json({ name: pkg.name, version: pkg.version });
  });
  
  app.all('*', (req, res, nextAll) => {
    console.log(`Received unrecognized request: ${req.method} ${req.originalUrl}`);
    nextAll(404);
  });
  
  return next();
};

// eslint-disable-next-line consistent-return
const register = (app, routes, cb) => {
  if (!routes.length) {
    return cb();
  }

  routes[0](app, (err) => {
    if (err) {
      console.error('Error registering routes:', err);
      return cb(err);
    }
    console.log(`Registered routes from ${routes[0].name}`);
    return register(app, routes.slice(1), cb);
  });
};

module.exports = (app, next) => {
  console.log('Registering routes...');
  register(app, [
    auth,
    users,
    products,
    orders,
    root,
  ], (err) => {
    if (err) {
      console.error('Error registering routes:', err);
      return next(err);
    }
    console.log('All routes registered successfully.');
    return next();
  });
};
