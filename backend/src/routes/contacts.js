
const express = require('express');
const router = express.Router();

const pool = require('../config/db');

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET all contacts
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM contacts WHERE user_id = $1 ORDER BY id DESC',
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching contacts:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve contacts'
        });
    }
});

// POST a new contact
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        const result = await pool.query(
            `INSERT INTO contacts (name, email, phone, address, user_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, email, phone, address, req.user.id]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error adding contact:', error.message);
        res.status(500).json({
            message: 'Failed to add contact'
        });
    }
});

// PUT (update) an existing contact
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address } = req.body;

        const result = await pool.query(
            `UPDATE contacts
            SET name = $1, email = $2, phone = $3, address = $4
            WHERE id = $5 AND user_id = $6
            RETURNING *`,
            [name, email, phone, address, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Contact not found'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating contact:', error.message);
        res.status(500).json({
            message: 'Failed to update contact'
        });
    }
});

// PATCH favorite status
router.patch('/:id/favorite', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE contacts
             SET is_favorite = NOT is_favorite
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Contact not found'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating favorite:', error.message);
        res.status(500).json({
            message: 'Failed to update favorite status'
        });
    }
});

// DELETE a contact
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Contact not found'
            });
        }

        res.json({
            message: 'Contact deleted successfully',
            contact: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting contact:', error.message);
        res.status(500).json({
            message: 'Failed to delete contact'
        });
    }
});

module.exports = router;
