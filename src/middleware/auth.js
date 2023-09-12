const jwt = require('jsonwebtoken');

module.exports = (secrets) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (req.url === '/auth' && req.method === 'POST') {
    return next(); 
  }

  if (!authorization) {
    console.info('Authorization header missing');
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    console.warn('Invalid authorization type');
    return next();
  }

  jwt.verify(token, secrets, (err, decodedToken) => {
    if (err) {
      console.error('Token verification failed:', err);
      return resp.status(403).send('Acesso proibido');
    }

    console.info('Token verified:', decodedToken);
    req.user = decodedToken;
    next();
  });
};

module.exports.requireAuth = (req, resp, next) => {
  if (!module.exports.isAuthenticated(req)) {
    return resp.status(401).send('Autenticação necessária');
  }
  next();
};

module.exports.isAuthenticated = (req) => {
  const { user } = req;
  return user !== undefined;
};

module.exports.isAdmin = (req) => {
  const { user } = req;
  return user && user.role && user.role === 'admin';
};

module.exports.requireAdmin = (req, resp, next) => {
  if (!module.exports.isAuthenticated(req)) {
    return resp.status(401).send('Autenticação necessária');
  }
  if (!module.exports.isAdmin(req)) {
    return resp.status(403).send('Acesso proibido');
  }
  next();
};
