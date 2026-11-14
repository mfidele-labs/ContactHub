
const express = require('express');
const cors = require('cors');

const contactRoutes = require('./routes/contacts');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('ContactHub Backend is running!');
});

module.exports = app;
