const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use(require('./middleware/errorHandler'));

app.listen(process.env.PORT || 5000, () => console.log(`Server on port ${process.env.PORT || 5000}`));