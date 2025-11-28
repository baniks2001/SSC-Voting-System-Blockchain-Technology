import express from 'express';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM courses WHERE is_active = true ORDER BY name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create new course
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO courses (name, code) VALUES (?, ?)',
      [name, code]
    );

    res.status(201).json({ id: result.insertId, message: 'Course created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Course already exists' });
    }
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

export default router;