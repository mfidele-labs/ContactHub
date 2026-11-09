const express = require('express');

const cors = require('cors');


const pool = require('./config/db');

const app = express();

app.use(cors());

const contactRoutes = require('./routes/contacts');

const authRoutes = require('./routes/auth');

app.use(express.json());

app.use('/api/contacts', contactRoutes);

app.use('/api/auth', authRoutes);

const PORT = 5000;

pool.query('SELECT NOW()')
    .then(result => {
        console.log('PostgreSQL connected successfully!');
        console.log('Database time:', result.rows[0].now);
    })
    .catch(error => {
        console.error('Database connection failed:', error.message);
    });

app.get('/', (req, res) => {
    res.send('ContactHub Backend is running with Nodemon!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});