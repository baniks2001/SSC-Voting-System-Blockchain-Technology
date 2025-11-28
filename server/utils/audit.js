import { pool } from '../config/database.js';

export const logAuditAction = async (userId, userType, action, details, req) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    await pool.execute(
      'INSERT INTO audit_logs (user_id, user_type, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, userType, action, details, ip, userAgent]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};