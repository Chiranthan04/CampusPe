const bcrypt = require('bcryptjs');
const demoHash = bcrypt.hashSync('password123', 10);

const store = {
  users: [
    {
      id: 1, name: 'Alice Johnson', email: 'alice@demo.com', phone: '9876543210',
      password: demoHash, reset_token: null, reset_token_expiry: null,
      created_at: new Date('2025-01-10'), updated_at: new Date('2025-01-10')
    },
    {
      id: 2, name: 'Bob Smith', email: 'bob@demo.com', phone: '9123456789',
      password: bcrypt.hashSync('bob1234', 10), reset_token: null, reset_token_expiry: null,
      created_at: new Date('2025-02-15'), updated_at: new Date('2025-02-15')
    }
  ],
  items: [
    { id: 1, user_id: 1, title: 'Set up project repo', description: 'Initialize Git and push initial commit', status: 'completed', created_at: new Date('2025-03-01'), updated_at: new Date('2025-03-01') },
    { id: 2, user_id: 1, title: 'Design database schema', description: 'Create MySQL tables for users and items', status: 'completed', created_at: new Date('2025-03-02'), updated_at: new Date('2025-03-02') },
    { id: 3, user_id: 1, title: 'Build auth APIs', description: 'Register, Login, Forgot & Reset Password', status: 'active', created_at: new Date('2025-03-05'), updated_at: new Date('2025-03-05') },
    { id: 4, user_id: 1, title: 'Build dashboard CRUD', description: 'GET, POST, PUT, DELETE for items', status: 'pending', created_at: new Date('2025-03-06'), updated_at: new Date('2025-03-06') },
    { id: 5, user_id: 2, title: 'Review pull request', description: 'Code review for feature branch', status: 'active', created_at: new Date('2025-03-08'), updated_at: new Date('2025-03-08') }
  ],
  _userIdCounter: 3,
  _itemIdCounter: 6,

  findUserByEmail(email) { return this.users.find(u => u.email === email) || null; },
  findUserById(id) { return this.users.find(u => u.id === id) || null; },
  findUserByResetToken(token) {
    return this.users.find(u => u.reset_token === token && u.reset_token_expiry > new Date()) || null;
  },
  insertUser({ name, email, phone, password }) {
    const user = { id: this._userIdCounter++, name, email, phone: phone || null, password,
      reset_token: null, reset_token_expiry: null, created_at: new Date(), updated_at: new Date() };
    this.users.push(user);
    return user;
  },
  updateUserResetToken(email, token, expiry) {
    const user = this.findUserByEmail(email);
    if (user) { user.reset_token = token; user.reset_token_expiry = expiry; }
  },
  updateUserPassword(id, hashedPassword) {
    const user = this.findUserById(id);
    if (user) { user.password = hashedPassword; user.reset_token = null; user.reset_token_expiry = null; }
  },
  getItemsByUser(userId) {
    return this.items.filter(i => i.user_id === userId).sort((a, b) => b.created_at - a.created_at);
  },
  getItemByIdAndUser(id, userId) { return this.items.find(i => i.id === id && i.user_id === userId) || null; },
  insertItem({ user_id, title, description, status }) {
    const item = { id: this._itemIdCounter++, user_id, title, description: description || null,
      status: status || 'active', created_at: new Date(), updated_at: new Date() };
    this.items.push(item);
    return item;
  },
  updateItem(id, { title, description, status }) {
    const item = this.items.find(i => i.id === id);
    if (item) { item.title = title; item.description = description || null; item.status = status; item.updated_at = new Date(); }
    return item;
  },
  deleteItem(id) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx !== -1) this.items.splice(idx, 1);
  },
  getStatsByUser(userId) {
    const userItems = this.items.filter(i => i.user_id === userId);
    return {
      total: userItems.length,
      active: userItems.filter(i => i.status === 'active').length,
      pending: userItems.filter(i => i.status === 'pending').length,
      completed: userItems.filter(i => i.status === 'completed').length
    };
  }
};

module.exports = store;