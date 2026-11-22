const express = require('express');
const cors = require('cors');

const pool = require('./config/db');
const contactRoutes = require('./routes/contacts');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Liveness: checks whether the application is running
app.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});

// Readiness: checks whether the database is reachable
app.get('/health/ready', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ready' });
    } catch (error) {
        res.status(503).json({ status: 'not ready' });
    }
});

app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('ContactHub Backend is running!');
});

module.exports = app;
