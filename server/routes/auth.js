import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { logAuditAction } from '../utils/audit.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('🔐 Admin login attempt for:', email);

    // Check for super admin
    if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
      console.log('🔓 Super admin login detected');
      
      const userData = {
        id: 0,
        email: email,
        type: 'admin',
        role: 'super_admin'
      };
      
      const token = generateToken(userData);

      await logAuditAction(0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', req);

      return res.json({
        token,
        user: {
          id: 0,
          email: email,
          fullName: 'Super Administrator',
          role: 'super_admin',
          isSuperAdmin: true,
          type: 'admin'
        }
      });
    }

    // Check regular admin
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      await logAuditAction(null, 'admin', 'LOGIN_FAILED', `Failed login attempt for email: ${email}`, req);
      return res.status(401).json({ error: 'Account not found' });
    }

    const admin = rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      await logAuditAction(admin.id, 'admin', 'LOGIN_FAILED', 'Invalid password', req);
      return res.status(401).json({ error: 'Invalid password' });
    }

    const userData = {
      id: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role
    };

    const token = generateToken(userData);

    await logAuditAction(admin.id, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', req);

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
        isSuperAdmin: admin.role === 'super_admin',
        type: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Voter login
router.post('/voter/login', async (req, res) => {
  try {
    const { studentId, emailOrStudentId, password } = req.body;

    const actualStudentId = studentId || emailOrStudentId;

    if (!actualStudentId || !password) {
      return res.status(400).json({ error: 'Student ID and password required' });
    }

    console.log('🔐 Voter login attempt for:', actualStudentId);

    const [rows] = await pool.execute(
      'SELECT * FROM voters WHERE student_id = ?',
      [actualStudentId]
    );

    if (rows.length === 0) {
      await logAuditAction(null, 'voter', 'LOGIN_FAILED', `Failed login attempt for student ID: ${actualStudentId}`, req);
      return res.status(401).json({ error: 'Account not found' });
    }

    const voter = rows[0];
    
    // Check if voter is active
    if (!voter.is_active) {
      console.log('❌ Login blocked: Voter account is inactive', { studentId: actualStudentId, is_active: voter.is_active });
      await logAuditAction(voter.id, 'voter', 'LOGIN_FAILED', 'Login attempted with inactive account', req);
      return res.status(401).json({ error: 'Account is inactive. Please contact administrator.' });
    }

    const isValidPassword = await bcrypt.compare(password, voter.password);

    if (!isValidPassword) {
      await logAuditAction(voter.id, 'voter', 'LOGIN_FAILED', 'Invalid password', req);
      return res.status(401).json({ error: 'Invalid password' });
    }

    const userData = {
      id: voter.id,
      email: voter.student_id,
      type: 'voter',
      role: 'voter'
    };

    const token = generateToken(userData);

    await logAuditAction(voter.id, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', req);

    res.json({
      token,
      user: {
        id: voter.id,
        studentId: voter.student_id,
        fullName: voter.full_name,
        course: voter.course,
        yearLevel: voter.year_level,
        section: voter.section,
        hasVoted: voter.has_voted,
        voteHash: voter.vote_hash,
        votedAt: voter.voted_at,
        is_active: voter.is_active,
        type: 'voter'
      }
    });
  } catch (error) {
    console.error('Voter login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Super Admin Password Verification
router.post('/super-admin/verify', authenticateAdmin, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password is required' 
      });
    }

    // Check if user is already authenticated as super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Super admin access required' 
      });
    }

    // Verify the password against environment variables
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (password === superAdminPassword) {
      console.log('✅ Super admin password verified successfully');
      
      await logAuditAction(
        req.user.id, 
        'admin', 
        'SUPER_ADMIN_VERIFIED', 
        'Super admin password verified for sensitive operation',
        req
      );

      return res.json({
        success: true,
        isSuperAdmin: true,
        message: 'Super admin verified successfully'
      });
    } else {
      console.log('❌ Super admin password verification failed');
      
      await logAuditAction(
        req.user.id, 
        'admin', 
        'SUPER_ADMIN_VERIFICATION_FAILED', 
        'Super admin password verification failed',
        req
      );

      return res.status(401).json({
        success: false,
        error: 'Invalid super admin password'
      });
    }

  } catch (error) {
    console.error('Super admin verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Super admin verification failed' 
    });
  }
});

// Token verification endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sscvoting@2025blockchain');
    
    if (decoded.type === 'admin') {
      if (decoded.id === 0) {
        return res.json({ valid: true, user: decoded });
      }
      
      const [admins] = await pool.execute(
        'SELECT id, email, full_name, role FROM admins WHERE id = ?',
        [decoded.id]
      );
      
      if (admins.length === 0) {
        return res.status(401).json({ error: 'Admin not found' });
      }
      
      res.json({ valid: true, user: decoded });
    } else {
      // Check if voter is still active during token verification
      const [voters] = await pool.execute(
        'SELECT id, student_id, full_name, is_active FROM voters WHERE id = ?',
        [decoded.id]
      );
      
      if (voters.length === 0) {
        return res.status(401).json({ error: 'Voter not found' });
      }

      const voter = voters[0];
      
      // Check if voter account is still active
      if (!voter.is_active) {
        console.log('❌ Token verification failed: Voter account is inactive', { voterId: voter.id });
        return res.status(401).json({ error: 'Account is inactive' });
      }
      
      res.json({ valid: true, user: decoded });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token signature' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(401).json({ error: 'Token verification failed' });
  }
});

// Helper function to generate JWT tokens
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    type: user.type,
    role: user.role
  };
  
  console.log('🔐 Generating token for:', payload);
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'sscvoting@2025blockchain', { expiresIn: '24h' });
  
  console.log('✅ Token generated:', {
    tokenLength: token.length,
    payload: payload
  });
  
  return token;
};

export default router;