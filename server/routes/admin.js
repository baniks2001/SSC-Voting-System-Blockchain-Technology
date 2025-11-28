// admin.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { authenticateAdmin, authenticateSuperAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [voterCount] = await pool.execute('SELECT COUNT(*) as count FROM voters');
    const [candidateCount] = await pool.execute('SELECT COUNT(*) as count FROM candidates WHERE is_active = true');
    const [votedCount] = await pool.execute('SELECT COUNT(*) as count FROM voters WHERE has_voted = true');

    // Try to get votes from blockchain first, fallback to database count
    let totalVotes = votedCount[0].count;

    try {
      const blockchainResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/voting/results`);
      if (blockchainResponse.ok) {
        const blockchainData = await blockchainResponse.json();
        if (blockchainData.success && blockchainData.totalVotes) {
          totalVotes = blockchainData.totalVotes;
          console.log('📊 Using blockchain total votes:', totalVotes);
        }
      }
    } catch (blockchainError) {
      console.log('⚠️ Using database vote count as fallback');
    }

    // Updated audit logs query with user names
    const [auditLogs] = await pool.execute(`
      SELECT 
        al.*,
        CASE 
          WHEN al.user_type = 'admin' AND al.user_id IS NOT NULL THEN (
            SELECT full_name FROM admins WHERE id = al.user_id
          )
          WHEN al.user_type = 'voter' AND al.user_id IS NOT NULL THEN (
            SELECT full_name FROM voters WHERE id = al.user_id
          )
          ELSE NULL
        END as user_name,
        CASE 
          WHEN al.user_type = 'admin' AND al.user_id IS NOT NULL THEN (
            SELECT email FROM admins WHERE id = al.user_id
          )
          WHEN al.user_type = 'voter' AND al.user_id IS NOT NULL THEN (
            SELECT student_id FROM voters WHERE id = al.user_id
          )
          ELSE NULL
        END as user_email
      FROM audit_logs al 
      ORDER BY al.created_at DESC 
      LIMIT 50
    `);

    res.json({
      totalVoters: voterCount[0].count,
      totalCandidates: candidateCount[0].count,
      totalVotes: totalVotes, // Use blockchain total if available
      auditLogs: auditLogs
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all admins - only super admin can access
router.get('/admins', authenticateAdmin, authenticateSuperAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, full_name, role, created_at, is_active FROM admins ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Create admin - only super admin can access
router.post('/admins', authenticateAdmin, authenticateSuperAdmin, async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Prevent creating another super admin
    if (role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot create super admin accounts' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO admins (email, password, full_name, role, created_by) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, fullName, role, req.user.id]
    );

    await logAuditAction(req.user.id, 'admin', 'CREATE_ADMIN', `Created admin: ${email}`, req);

    res.status(201).json({ id: result.insertId, message: 'Admin created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Update admin - only super admin can access
router.put('/admins/:id', authenticateAdmin, authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName, role, password } = req.body;

    // Prevent modifying super admin (id: 0 doesn't exist in DB)
    if (parseInt(id) === 0) {
      return res.status(403).json({ error: 'Cannot modify super admin' });
    }

    let query = 'UPDATE admins SET email = ?, full_name = ?, role = ?';
    let params = [email, fullName, role];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    await logAuditAction(req.user.id, 'admin', 'UPDATE_ADMIN', `Updated admin ID: ${id}`, req);

    res.json({ message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

// Delete admin - only super admin can access
router.delete('/admins/:id', authenticateAdmin, authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting super admin (id: 0 doesn't exist in DB)
    if (parseInt(id) === 0) {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }

    await pool.execute('DELETE FROM admins WHERE id = ?', [id]);

    await logAuditAction(req.user.id, 'admin', 'DELETE_ADMIN', `Deleted admin ID: ${id}`, req);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

export default router;