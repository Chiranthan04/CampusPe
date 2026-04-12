const store = require('../data/store');

exports.getItems = (req, res, next) => {
  try {
    const items = store.getItemsByUser(req.user.id);
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

exports.getItem = (req, res, next) => {
  try {
    const item = store.getItemByIdAndUser(parseInt(req.params.id), req.user.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

exports.createItem = (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const item = store.insertItem({ user_id: req.user.id, title, description, status });
    res.status(201).json({ success: true, item });
  } catch (err) { next(err); }
};

exports.updateItem = (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const existing = store.getItemByIdAndUser(parseInt(req.params.id), req.user.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Item not found' });
    const item = store.updateItem(parseInt(req.params.id), { title, description, status });
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

exports.deleteItem = (req, res, next) => {
  try {
    const existing = store.getItemByIdAndUser(parseInt(req.params.id), req.user.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Item not found' });
    store.deleteItem(parseInt(req.params.id));
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) { next(err); }
};

exports.getStats = (req, res, next) => {
  try {
    const stats = store.getStatsByUser(req.user.id);
    res.json({ success: true, stats });
  } catch (err) { next(err); }
};