const jwt = require('jsonwebtoken');
const store = require('../data/store');
require('dotenv').config();

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret_key');
    const user = store.findUserById(decoded.id);
    if (!user)
      return res.status(401).json({ success: false, message: 'User not found' });
    req.user = { id: user.id, name: user.name, email: user.email, phone: user.phone };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };