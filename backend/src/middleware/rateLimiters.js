const rateLimit = require('express-rate-limit');

// Limit password-reset requests
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: 'Too many password-reset requests. Please try again after 15 minutes.'
    }
});

// Limit password-reset submissions
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: 'Too many password-reset attempts. Please try again after 15 minutes.'
    }
});

module.exports = {
    forgotPasswordLimiter,
    resetPasswordLimiter
};