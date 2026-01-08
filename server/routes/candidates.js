import express from 'express';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get current directory for file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/candidates');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'candidate-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all candidates
router.get('/', async (req, res) => {
  try {
    console.log('🗳️ Fetching active candidates for voting');
    const [rows] = await pool.execute(
      'SELECT * FROM candidates WHERE is_active = true ORDER BY position, name'
    );
    
    // Add full image URL to each candidate
    const candidatesWithImageUrl = rows.map(candidate => ({
      ...candidate,
      image_url: candidate.image_url ? 
        `${req.protocol}://${req.get('host')}/uploads/candidates/${candidate.image_url}` : 
        null
    }));
    
    console.log('✅ Active candidates fetched, count:', rows.length);
    res.json(candidatesWithImageUrl);
  } catch (error) {
    console.error('Get candidates error:', error);
    console.log('❌ Get candidates error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get candidates for admin
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    console.log('👥 Fetching all candidates for admin:', req.user.email || req.user.id);
    const [rows] = await pool.execute(
      'SELECT * FROM candidates ORDER BY created_at DESC'
    );
    
    // Add full image URL to each candidate
    const candidatesWithImageUrl = rows.map(candidate => ({
      ...candidate,
      image_url: candidate.image_url ? 
        `${req.protocol}://${req.get('host')}/uploads/candidates/${candidate.image_url}` : 
        null
    }));
    
    console.log('✅ All candidates fetched for admin, count:', rows.length);
    res.json(candidatesWithImageUrl);
  } catch (error) {
    console.error('Get candidates error:', error);
    console.log('❌ Get candidates for admin error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Create candidate with image upload
router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('➕ Creating new candidate:', req.body.name, 'by admin:', req.user.email || req.user.id);
    const { name, party, position } = req.body;

    if (!name || !party || !position) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Name, party, and position are required' });
    }

    let imageUrl = null;
    let imagePath = null;

    if (req.file) {
      imageUrl = req.file.filename;
      imagePath = `/uploads/candidates/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      'INSERT INTO candidates (name, party, position, image_url, image_path) VALUES (?, ?, ?, ?, ?)',
      [name, party, position, imageUrl, imagePath]
    );

    await logAuditAction(req.user.id, 'admin', 'CREATE_CANDIDATE', `Created candidate: ${name}`, req);

    console.log('✅ Candidate created successfully:', name);
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Candidate created successfully',
      image_url: imageUrl ? `${req.protocol}://${req.get('host')}${imagePath}` : null
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create candidate error:', error);
    console.log('❌ Create candidate error for:', req.body.name, error.message);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Update candidate with optional image upload
router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('✏️ Updating candidate ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;
    const { name, party, position, current_image_url } = req.body;

    // Get current candidate to check existing image
    const [currentCandidate] = await pool.execute('SELECT image_url FROM candidates WHERE id = ?', [id]);
    
    let imageUrl = current_image_url || null;
    let imagePath = current_image_url ? `/uploads/candidates/${current_image_url}` : null;

    // If new image is uploaded
    if (req.file) {
      // Delete old image file if exists
      if (currentCandidate[0]?.image_url) {
        const oldImagePath = path.join(__dirname, '../../uploads/candidates', currentCandidate[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      imageUrl = req.file.filename;
      imagePath = `/uploads/candidates/${req.file.filename}`;
    }

    await pool.execute(
      'UPDATE candidates SET name = ?, party = ?, position = ?, image_url = ?, image_path = ? WHERE id = ?',
      [name, party, position, imageUrl, imagePath, id]
    );

    await logAuditAction(req.user.id, 'admin', 'UPDATE_CANDIDATE', `Updated candidate ID: ${id}`, req);

    console.log('✅ Candidate updated successfully, ID:', id);
    res.json({ 
      message: 'Candidate updated successfully',
      image_url: imageUrl ? `${req.protocol}://${req.get('host')}${imagePath}` : null
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update candidate error:', error);
    console.log('❌ Update candidate error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate - ACTUAL DELETION FROM DATABASE
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('🗑️ DELETING candidate ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;

    // Check if candidate exists first
    const [candidate] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]);
    if (candidate.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Delete image file if exists
    if (candidate[0].image_url) {
      const imagePath = path.join(__dirname, '../../uploads/candidates', candidate[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Perform ACTUAL deletion from database
    const [result] = await pool.execute('DELETE FROM candidates WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    await logAuditAction(req.user.id, 'admin', 'DELETE_CANDIDATE', `Permanently deleted candidate ID: ${id}`, req);

    console.log('✅ Candidate PERMANENTLY DELETED, ID:', id);
    res.json({ message: 'Candidate permanently deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    console.log('❌ Delete candidate error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;