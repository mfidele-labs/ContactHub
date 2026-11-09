
const express = require('express');
const router = express.Router();

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const authMiddleware = require('../middleware/authMiddleware');
const { sendPasswordResetEmail } = require('../services/emailService');

const {
    forgotPasswordLimiter,
    resetPasswordLimiter
} = require('../middleware/rateLimiters');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        }

        const passwordBytes = Buffer.byteLength(password, 'utf8');

        if (password.length < 8 || passwordBytes > 72) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and no more than 72 bytes.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name.trim(), email.trim().toLowerCase(), passwordHash]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        console.error('Registration error:', error.message);

        res.status(500).json({
            message: 'Registration failed'
        });
    }
});

// Login an existing user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const result = await pool.query(
            `SELECT id, name, email, password_hash, token_version
             FROM users
             WHERE email = $1`,
            [email.trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Include the current database token version
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                tokenVersion: user.token_version
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);

        res.status(500).json({
            message: 'Login failed'
        });
    }
});

// Request a password-reset email
router.post(
    '/forgot-password',
    forgotPasswordLimiter,
    async (req, res) => {
        const genericMessage =
            'If an account exists with that email, a password-reset link will be sent.';

        try {
            const { email } = req.body;

            if (!email || typeof email !== 'string') {
                return res.status(400).json({
                    message: 'Please provide a valid email address.'
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const result = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [normalizedEmail]
            );

            if (result.rows.length === 0) {
                return res.json({ message: genericMessage });
            }

            const userId = result.rows[0].id;

            const resetToken = crypto.randomBytes(32).toString('hex');

            const tokenHash = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await pool.query(
                `INSERT INTO password_reset_tokens
                    (user_id, token_hash, expires_at)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id)
                 DO UPDATE SET
                    token_hash = EXCLUDED.token_hash,
                    expires_at = EXCLUDED.expires_at,
                    created_at = CURRENT_TIMESTAMP`,
                [userId, tokenHash, expiresAt]
            );

            const resetUrl =
                `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            try {
                await sendPasswordResetEmail(normalizedEmail, resetUrl);
            } catch (emailError) {
                await pool.query(
                    'DELETE FROM password_reset_tokens WHERE user_id = $1',
                    [userId]
                );

                throw emailError;
            }

            res.json({ message: genericMessage });

        } catch (error) {
            console.error('Forgot password error:', error.message);

            res.json({ message: genericMessage });
        }
    }
);

// Reset password using a valid reset token
router.post(
    '/reset-password',
    resetPasswordLimiter,
    async (req, res) => {
        const { token, password } = req.body;

        if (!token || typeof token !== 'string' ||
            !password || typeof password !== 'string') {
            return res.status(400).json({
                message: 'Reset token and new password are required.'
            });
        }

        const passwordBytes = Buffer.byteLength(password, 'utf8');

        if (password.length < 8 || passwordBytes > 72) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and no more than 72 bytes.'
            });
        }

        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        let client;
        let transactionStarted = false;

        try {
            const passwordHash = await bcrypt.hash(password, 12);

            client = await pool.connect();

            await client.query('BEGIN');
            transactionStarted = true;

            const result = await client.query(
                `SELECT user_id
                 FROM password_reset_tokens
                 WHERE token_hash = $1
                 AND expires_at > CURRENT_TIMESTAMP
                 FOR UPDATE`,
                [tokenHash]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                transactionStarted = false;

                return res.status(400).json({
                    message: 'This reset link is invalid or has expired.'
                });
            }

            const userId = result.rows[0].user_id;

            // Change password and invalidate all previous sessions
            await client.query(
                `UPDATE users
                 SET password_hash = $1,
                     token_version = token_version + 1
                 WHERE id = $2`,
                [passwordHash, userId]
            );

            await client.query(
                'DELETE FROM password_reset_tokens WHERE user_id = $1',
                [userId]
            );

            await client.query('COMMIT');
            transactionStarted = false;

            res.json({
                message: 'Your password has been reset successfully. Please sign in.'
            });

        } catch (error) {
            if (client && transactionStarted) {
                try {
                    await client.query('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Rollback error:', rollbackError.message);
                }
            }

            console.error('Password reset error:', error.message);

            res.status(500).json({
                message: 'Unable to reset your password. Please try again.'
            });

        } finally {
            if (client) {
                client.release();
            }
        }
    }
);

// Verify current user's session
router.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

module.exports = router;
