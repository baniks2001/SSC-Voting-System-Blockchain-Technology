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

    // Return the complete course object
    const [newCourse] = await pool.execute(
      'SELECT * FROM courses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCourse[0] || { id: result.insertId, name, code });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Course already exists' });
    }
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Delete course
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course has voters assigned
    const [votersWithCourse] = await pool.execute(
      'SELECT COUNT(*) as count FROM voters WHERE course = (SELECT name FROM courses WHERE id = ?)',
      [id]
    );
    
    if (votersWithCourse[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete course because it is assigned to voters. Please reassign or delete those voters first.' 
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM courses WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    
    // Handle foreign key constraint errors
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(400).json({ 
        error: 'Cannot delete course because it is assigned to voters. Please reassign or delete those voters first.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Update course
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const [result] = await pool.execute(
      'UPDATE courses SET name = ?, code = ? WHERE id = ?',
      [name, code, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const [updatedCourse] = await pool.execute(
      'SELECT * FROM courses WHERE id = ?',
      [id]
    );

    res.json(updatedCourse[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Course already exists' });
    }
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

export default router;