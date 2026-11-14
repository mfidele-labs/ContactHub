
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

pool.query('SELECT NOW()')
    .then(result => {
        console.log('PostgreSQL connected successfully!');
        console.log('Database time:', result.rows[0].now);
    })
    .catch(error => {
        console.error('Database connection failed:', error.message);
    });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
