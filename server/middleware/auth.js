// middleware/auth.js - Fixed JWT handling
import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';

// Use EXACTLY the same secret as in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'sscvoting@2025blockchain';

console.log('🔐 JWT Configuration:', {
  secretFromEnv: !!process.env.JWT_SECRET,
  secretLength: JWT_SECRET.length,
  usingFallback: !process.env.JWT_SECRET
});

// Helper function to extract token from request
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// Enhanced JWT verification with detailed error logging
const verifyToken = (token) => {
  try {
    console.log('🔐 Verifying token:', {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token verified successfully:', {
      id: decoded.id,
      type: decoded.type,
      role: decoded.role,
      email: decoded.email
    });
    
    return decoded;
  } catch (error) {
    console.error('❌ JWT Verification Failed:', {
      error: error.name,
      message: error.message,
      tokenLength: token?.length,
      secretLength: JWT_SECRET.length
    });
    throw error;
  }
};

// Admin authentication middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    
    if (!token) {
      console.log('❌ No token provided for admin route');
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log('🔐 Admin authentication started');
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'admin') {
      console.log('❌ Non-admin user trying to access admin route:', decoded.type);
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Handle super admin (id: 0)
    if (decoded.id === 0 && decoded.role === 'super_admin') {
      req.user = {
        id: 0,
        email: decoded.email,
        name: 'Super Administrator',
        type: 'admin',
        role: 'super_admin'
      };
      req.admin = req.user;
      console.log('🔓 Super admin authenticated via JWT');
      return next();
    }

    // Check regular admin in database
    const [admins] = await pool.execute(
      'SELECT id, email, full_name, role FROM admins WHERE id = ?',
      [decoded.id]
    );
    
    if (admins.length === 0) {
      console.log('❌ Admin not found in database for admin route:', decoded.id);
      return res.status(401).json({ error: 'Admin not found' });
    }
    
    req.user = {
      id: admins[0].id,
      email: admins[0].email,
      name: admins[0].full_name,
      type: 'admin',
      role: admins[0].role
    };
    
    req.admin = admins[0];
    console.log('✅ Admin authenticated from database:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token signature' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Admin authentication failed' });
  }
};

// Helper function to generate JWT tokens
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    type: user.type,
    role: user.role
  };
  
  console.log('🔐 Generating token for:', payload);
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  
  console.log('✅ Token generated:', {
    tokenLength: token.length,
    payload: payload
  });
  
  return token;
};

// Main authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    if (decoded.type === 'admin') {
      if (decoded.id === 0 && decoded.role === 'super_admin') {
        req.user = {
          id: 0,
          email: decoded.email,
          name: 'Super Administrator',
          type: 'admin',
          role: 'super_admin'
        };
        req.admin = req.user;
        return next();
      }

      const [admins] = await pool.execute(
        'SELECT id, email, full_name, role FROM admins WHERE id = ?',
        [decoded.id]
      );
      
      if (admins.length === 0) {
        return res.status(401).json({ error: 'Admin not found' });
      }
      
      req.user = {
        id: admins[0].id,
        email: admins[0].email,
        name: admins[0].full_name,
        type: 'admin',
        role: admins[0].role
      };
      
      req.admin = admins[0];
    } 
    else if (decoded.type === 'voter') {
      const [voters] = await pool.execute(
        'SELECT id, student_id, full_name, course, year_level, section, has_voted FROM voters WHERE id = ?',
        [decoded.id]
      );
      
      if (voters.length === 0) {
        return res.status(401).json({ error: 'Voter not found' });
      }
      
      req.user = {
        id: voters[0].id,
        email: voters[0].student_id,
        name: voters[0].full_name,
        type: 'voter',
        role: 'voter',
        course: voters[0].course,
        year_level: voters[0].year_level,
        section: voters[0].section,
        has_voted: voters[0].has_voted
      };
    } 
    else {
      return res.status(401).json({ error: 'Invalid user type' });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token signature' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Super admin authentication middleware
export const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (decoded.id === 0 && decoded.role === 'super_admin') {
      req.user = {
        id: 0,
        email: decoded.email,
        name: 'Super Administrator',
        type: 'admin',
        role: 'super_admin'
      };
      req.admin = req.user;
      return next();
    }

    const [admins] = await pool.execute(
      'SELECT id, email, full_name, role FROM admins WHERE id = ? AND role = "super_admin"',
      [decoded.id]
    );
    
    if (admins.length === 0) {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    req.user = {
      id: admins[0].id,
      email: admins[0].email,
      name: admins[0].full_name,
      type: 'admin',
      role: 'super_admin'
    };
    
    req.admin = admins[0];
    next();
  } catch (error) {
    console.error('Super admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token signature' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Super admin authentication failed' });
  }
};

// Voter authentication middleware
export const authenticateVoter = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'voter') {
      return res.status(403).json({ error: 'Voter access required' });
    }

    const [voters] = await pool.execute(
      'SELECT id, student_id, full_name, course, year_level, section, has_voted FROM voters WHERE id = ?',
      [decoded.id]
    );
    
    if (voters.length === 0) {
      return res.status(401).json({ error: 'Voter not found' });
    }
    
    req.user = {
      id: voters[0].id,
      email: voters[0].student_id,
      name: voters[0].full_name,
      type: 'voter',
      role: 'voter',
      course: voters[0].course,
      year_level: voters[0].year_level,
      section: voters[0].section,
      has_voted: voters[0].has_voted
    };
    
    next();
  } catch (error) {
    console.error('Voter authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token signature' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Voter authentication failed' });
  }
};

// Export authenticateToken as auth for backward compatibility
export const auth = authenticateToken;