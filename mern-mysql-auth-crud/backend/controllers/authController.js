const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const store = require('../data/store');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    if (store.findUserByEmail(email))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = store.insertUser({ name, email, phone, password: hashed });

    res.status(201).json({ success: true, token: generateToken(user.id), user: safeUser(user) });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = store.findUserByEmail(email);
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({ success: true, token: generateToken(user.id), user: safeUser(user) });
  } catch (err) { next(err); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = store.findUserByEmail(email);
    if (!user)
      return res.status(404).json({ success: false, message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);
    store.updateUserResetToken(email, token, expiry);

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    res.json({
      success: true,
      message: 'Password reset initiated',
      demo_reset_token: token,
      demo_reset_url: resetUrl
    });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = store.findUserByResetToken(token);
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(password, 10);
    store.updateUserPassword(user.id, hashed);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};