
const { test } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/app');

test('GET / should return the ContactHub backend message', async () => {
    const server = app.listen(0);

    try {
        const address = server.address();

        const response = await fetch(
            `http://127.0.0.1:${address.port}/`
        );

        assert.equal(response.status, 200);

        const message = await response.text();

        assert.equal(
            message,
            'ContactHub Backend is running!'
        );

    } finally {
        await new Promise((resolve, reject) => {
            server.close(error => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
});


test('GET /api/contacts should reject requests without a token', async () => {
    const server = app.listen(0);

    try {
        const address = server.address();

        const response = await fetch(
            `http://127.0.0.1:${address.port}/api/contacts`
        );

        assert.equal(response.status, 401);

        const body = await response.json();

        assert.equal(
            body.message,
            'Access denied. No token provided.'
        );

    } finally {
        await new Promise((resolve, reject) => {
            server.close(error => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
});
