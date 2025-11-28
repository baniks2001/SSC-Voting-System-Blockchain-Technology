import express from 'express';
import { pool, query } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js'; // ADDED: Import authentication
import { logAuditAction } from '../utils/audit.js'; // ADDED: Import audit logging

const router = express.Router();

// GET /positions - Get all positions
router.get('/', async (req, res) => {
  try {
    const positions = await query(`
      SELECT * FROM positions 
      ORDER BY display_order ASC
    `);
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// GET /positions/active - Get active positions
router.get('/active', async (req, res) => {
  try {
    const positions = await query(`
      SELECT * FROM positions 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `);
    res.json(positions);
  } catch (error) {
    console.error('Error fetching active positions:', error);
    res.status(500).json({ error: 'Failed to fetch active positions' });
  }
});

// POST /positions - Create new position
router.post('/', authenticateAdmin, async (req, res) => { // ADDED: authenticateAdmin
  try {
    console.log('➕ Creating new position:', req.body.name, 'by admin:', req.user.email || req.user.id);
    const { name, maxVotes, order } = req.body;
    
    // Validate required fields
    if (!name || !maxVotes) {
      return res.status(400).json({ error: 'Name and maxVotes are required' });
    }
    
    const result = await query(`
      INSERT INTO positions (name, max_votes, display_order, is_active) 
      VALUES (?, ?, ?, ?)
    `, [name, maxVotes, order || 0, true]);
    
    const position = await query('SELECT * FROM positions WHERE id = ?', [result.insertId]);
    
    await logAuditAction(req.user.id, 'admin', 'CREATE_POSITION', `Created position: ${name}`, req); // ADDED: Audit log
    
    console.log('✅ Position created successfully:', name);
    res.json(position[0]);
  } catch (error) {
    console.error('Error creating position:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Position name already exists' });
    }
    res.status(500).json({ error: 'Failed to create position' });
  }
});

// PUT /positions/:id - Update position
router.put('/:id', authenticateAdmin, async (req, res) => { // ADDED: authenticateAdmin
  try {
    console.log('✏️ Updating position ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;
    const { name, maxVotes, order, is_active } = req.body;
    
    // Check if position exists
    const existingPosition = await query('SELECT * FROM positions WHERE id = ?', [id]);
    if (!existingPosition.length) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    await query(`
      UPDATE positions 
      SET name = ?, max_votes = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `, [name, maxVotes, order, is_active, id]);
    
    const position = await query('SELECT * FROM positions WHERE id = ?', [id]);
    
    await logAuditAction(req.user.id, 'admin', 'UPDATE_POSITION', `Updated position ID: ${id}`, req); // ADDED: Audit log
    
    console.log('✅ Position updated successfully, ID:', id);
    res.json(position[0]);
  } catch (error) {
    console.error('Error updating position:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Position name already exists' });
    }
    res.status(500).json({ error: 'Failed to update position' });
  }
});

// DELETE /positions/:id - Delete position
router.delete('/:id', authenticateAdmin, async (req, res) => { // ADDED: authenticateAdmin
  try {
    console.log('🗑️ DELETING position ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;
    
    // Check if position exists
    const existingPosition = await query('SELECT * FROM positions WHERE id = ?', [id]);
    if (!existingPosition.length) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    // Check if position has candidates
    const candidates = await query('SELECT * FROM candidates WHERE position_id = ?', [id]);
    if (candidates.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete position with existing candidates. Delete candidates first.' 
      });
    }
    
    const result = await query('DELETE FROM positions WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    await logAuditAction(req.user.id, 'admin', 'DELETE_POSITION', `Permanently deleted position ID: ${id}`, req); // ADDED: Audit log
    
    console.log('✅ Position PERMANENTLY DELETED, ID:', id);
    res.json({ message: 'Position permanently deleted successfully' });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ error: 'Failed to delete position' });
  }
});

// GET /positions/:id - Get position by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const position = await query('SELECT * FROM positions WHERE id = ?', [id]);
    
    if (!position.length) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    res.json(position[0]);
  } catch (error) {
    console.error('Error fetching position:', error);
    res.status(500).json({ error: 'Failed to fetch position' });
  }
});

export default router;