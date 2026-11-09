
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check the current token version in PostgreSQL
        const result = await pool.query(
            'SELECT token_version FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'User account no longer exists.'
            });
        }

        const currentVersion = result.rows[0].token_version;

        // Reject tokens issued before a password reset
        if (decoded.tokenVersion !== currentVersion) {
            return res.status(401).json({
                message: 'Your session is no longer valid. Please sign in again.'
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        console.error('Authentication error:', error.message);

        return res.status(500).json({
            message: 'Unable to verify your session.'
        });
    }
};

module.exports = authMiddleware;
