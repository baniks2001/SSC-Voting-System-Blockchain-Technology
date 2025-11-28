import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Get all voters
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('👥 Fetching voters with filters by admin:', req.user.email || req.user.id);
    const { search, course, year, section, hasVoted, isActive } = req.query;
    let query = 'SELECT id, student_id, full_name, course, year_level, section, has_voted, voted_at, created_at, is_active FROM voters WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (student_id LIKE ? OR full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (course) {
      query += ' AND course = ?';
      params.push(course);
    }

    if (year) {
      query += ' AND year_level = ?';
      params.push(year);
    }

    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }

    if (hasVoted) {
      if (hasVoted === 'voted') {
        query += ' AND has_voted = true';
      } else if (hasVoted === 'not_voted') {
        query += ' AND has_voted = false';
      }
    }

    if (isActive) {
      if (isActive === 'true') {
        query += ' AND is_active = true';
      } else if (isActive === 'false') {
        query += ' AND is_active = false';
      }
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    console.log('✅ Voters fetched successfully, count:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Get voters error:', error);
    console.log('❌ Get voters error:', error.message);
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
});

// Get voter status by student ID
router.get('/status/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log('🔍 Checking voter status for student ID:', studentId);

    const [voters] = await pool.execute(
      'SELECT id, student_id, full_name, has_voted, is_active FROM voters WHERE student_id = ?',
      [studentId]
    );

    if (voters.length === 0) {
      console.log('❌ Voter not found for student ID:', studentId);
      return res.status(404).json({ 
        error: 'Voter not found',
        has_voted: false 
      });
    }

    const voter = voters[0];
    
    console.log('✅ Voter status found:', {
      studentId: voter.student_id,
      has_voted: voter.has_voted,
      is_active: voter.is_active
    });

    res.json({
      has_voted: voter.has_voted,
      is_active: voter.is_active,
      voter_id: voter.id,
      student_id: voter.student_id,
      full_name: voter.full_name
    });
  } catch (error) {
    console.error('❌ Voter status check error:', error);
    res.status(500).json({ 
      error: 'Failed to check voter status',
      has_voted: false 
    });
  }
});

// Export voters
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    console.log('📤 Export endpoint called with query:', req.query);

    const {
      course,
      year,
      section,
      hasVoted,
      search,
      courses,
      studentIds,
      decryptPasswords,
      isActive
    } = req.query;

    // Handle include fields - fix parameter name
    const includeFields = req.query['include[]'] || req.query.include || [];
    const includeArray = Array.isArray(includeFields) ? includeFields : [includeFields].filter(Boolean);

    const coursesArray = Array.isArray(courses) ? courses : [courses].filter(Boolean);
    const studentIdsArray = Array.isArray(studentIds) ? studentIds : [studentIds].filter(Boolean);

    console.log('🔍 Include fields requested:', includeArray);

    // Map frontend field names to database column names - FIXED MAPPING
    const fieldMapping = {
      studentId: 'student_id',
      fullName: 'full_name',
      course: 'course',
      yearLevel: 'year_level',
      section: 'section',
      hasVoted: 'has_voted',
      votedAt: 'voted_at',
      createdAt: 'created_at',
      isActive: 'is_active'
      // password is handled separately
    };

    // Start with basic required fields
    let selectFields = ['id']; // Always include ID for processing

    // If specific fields are requested, use them; otherwise, use all basic fields
    if (includeArray.length > 0) {
      includeArray.forEach(field => {
        if (fieldMapping[field]) {
          selectFields.push(fieldMapping[field]);
        }
      });

      // Always include password field if password option is selected
      if (includeArray.includes('password') && decryptPasswords === 'true') {
        selectFields.push('student_id', 'full_name', 'year_level', 'section');
      }
    } else {
      // Default fields if none specified
      selectFields = ['student_id', 'full_name', 'course', 'year_level', 'section', 'has_voted', 'is_active'];
    }

    console.log('📊 Fields to select from database:', selectFields);

    let query = `SELECT ${selectFields.join(', ')} FROM voters WHERE 1=1`;
    const params = [];

    // Apply filters
    if (studentIdsArray.length > 0 && studentIdsArray[0] !== '') {
      const placeholders = studentIdsArray.map(() => '?').join(',');
      query += ` AND id IN (${placeholders})`;
      params.push(...studentIdsArray.map(id => parseInt(id)));
      console.log('✅ Applied student IDs filter:', studentIdsArray);
    }
    else if (coursesArray.length > 0 && coursesArray[0] !== '') {
      const placeholders = coursesArray.map(() => '?').join(',');
      query += ` AND course IN (${placeholders})`;
      params.push(...coursesArray);
      console.log('✅ Applied course filters:', coursesArray);
    }

    if (course && course !== '') {
      query += ' AND course = ?';
      params.push(course);
    }

    if (year && year !== '') {
      query += ' AND year_level = ?';
      params.push(parseInt(year));
    }

    if (section && section !== '') {
      query += ' AND section = ?';
      params.push(section);
    }

    if (hasVoted === 'voted') {
      query += ' AND has_voted = true';
    } else if (hasVoted === 'not_voted') {
      query += ' AND has_voted = false';
    }

    if (isActive) {
      if (isActive === 'true') {
        query += ' AND is_active = true';
      } else if (isActive === 'false') {
        query += ' AND is_active = false';
      }
    }

    if (search) {
      query += ' AND (student_id LIKE ? OR full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY course, year_level, section, full_name';

    console.log('🔍 Final query:', query);
    console.log('📋 Query params:', params);

    const [voters] = await pool.execute(query, params);
    console.log('✅ Database query successful, found:', voters.length, 'voters');

    if (voters.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No voters found matching the criteria'
      });
    }

    // Process data for export - ONLY INCLUDED FIELDS
    const processedVoters = voters.map(voter => {
      const voterData = {};

      // Handle each field based on includeArray
      if (includeArray.length > 0) {
        includeArray.forEach(field => {
          switch (field) {
            case 'studentId':
              voterData.student_id = voter.student_id;
              break;
            case 'fullName':
              voterData.full_name = voter.full_name;
              break;
            case 'course':
              voterData.course = voter.course;
              break;
            case 'yearLevel':
              voterData.year_level = voter.year_level;
              break;
            case 'section':
              voterData.section = voter.section;
              break;
            case 'hasVoted':
              voterData.has_voted = voter.has_voted ? 'Yes' : 'No';
              break;
            case 'votedAt':
              if (voter.voted_at) {
                voterData.voted_at = new Date(voter.voted_at).toLocaleString();
              } else {
                voterData.voted_at = 'Not Voted';
              }
              break;
            case 'createdAt':
              if (voter.created_at) {
                voterData.created_at = new Date(voter.created_at).toLocaleString();
              }
              break;
            case 'isActive':
              voterData.is_active = voter.is_active ? 'Active' : 'Inactive';
              break;
            case 'password':
              // Generate temporary password using the same function as frontend
              if (decryptPasswords === 'true') {
                voterData.password = generateTemporaryPassword(voter);
              }
              break;
          }
        });
      } else {
        // Default fields if none specified
        voterData.student_id = voter.student_id;
        voterData.full_name = voter.full_name;
        voterData.course = voter.course;
        voterData.year_level = voter.year_level;
        voterData.section = voter.section;
        voterData.has_voted = voter.has_voted ? 'Yes' : 'No';
        voterData.is_active = voter.is_active ? 'Active' : 'Inactive';

        // Include password if decryptPasswords is true
        if (decryptPasswords === 'true') {
          voterData.password = generateTemporaryPassword(voter);
        }
      }

      return voterData;
    });

    console.log('✅ Processed voters data sample:', processedVoters[0]);
    console.log('📊 Fields in exported data:', Object.keys(processedVoters[0]));

    res.json({
      success: true,
      data: processedVoters,
      count: processedVoters.length,
      exportedAt: new Date().toISOString(),
      includedFields: includeArray.length > 0 ? includeArray : ['all basic fields']
    });

  } catch (error) {
    console.error('❌ Export voters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export voters data: ' + error.message
    });
  }
});

// Function to generate temporary passwords (same algorithm as frontend)
function generateTemporaryPassword(voter) {
  try {
    const studentId = voter.student_id || '';
    const fullName = voter.full_name || '';
    const yearLevel = voter.year_level || 1;
    const section = voter.section || '';

    if (!fullName.trim() || !studentId.trim()) {
      return 'PASSWORD_UNAVAILABLE';
    }

    const lastThreeDigits = studentId.trim().slice(-3);
    const nameParts = fullName.trim().split(/\s+/);
    const initials = nameParts.map(part => part.charAt(0).toLowerCase()).join('');
    const cleanSection = section.replace(/\s+/g, '').toLowerCase();

    return `${initials}${yearLevel}${cleanSection}-${lastThreeDigits}`;
  } catch (error) {
    console.error('Password generation error:', error);
    return 'GENERATION_ERROR';
  }
}

// Create voter
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('➕ Creating new voter:', req.body.studentId, 'by admin:', req.user.email || req.user.id);
    const { studentId, fullName, course, yearLevel, section, password, isActive = true } = req.body;

    if (!studentId || !fullName || !course || !yearLevel || !section || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO voters (student_id, full_name, course, year_level, section, password, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, fullName, course, yearLevel, section, hashedPassword, isActive]
    );

    await logAuditAction(req.user.id, 'admin', 'CREATE_VOTER', `Created voter: ${studentId}`, req);

    console.log('✅ Voter created successfully:', studentId);
    res.status(201).json({ id: result.insertId, message: 'Voter created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('❌ Voter creation failed - Student ID already exists:', req.body.studentId);
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    console.error('Create voter error:', error);
    console.log('❌ Create voter error for:', req.body.studentId, error.message);
    res.status(500).json({ error: 'Failed to create voter' });
  }
});

// Update voter - FIXED: Now handles both regular updates and voting period updates
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('✏️ Updating voter ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    console.log('📦 Request body:', req.body);
    
    const { id } = req.params;
    const { studentId, fullName, course, yearLevel, section, password, isActive } = req.body;

    // Check if this is a voting period update (only password and isActive)
    const isVotingPeriodUpdate = !studentId && !fullName && !course && !yearLevel && !section;

    let query = 'UPDATE voters SET ';
    const params = [];
    const updates = [];

    // Always update isActive if provided
    if (typeof isActive === 'boolean') {
      updates.push('is_active = ?');
      params.push(isActive);
    }

    // During voting period, only allow password and isActive updates
    if (isVotingPeriodUpdate) {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }
    } else {
      // Regular update - allow all fields
      if (studentId) {
        updates.push('student_id = ?');
        params.push(studentId);
      }
      if (fullName) {
        updates.push('full_name = ?');
        params.push(fullName);
      }
      if (course) {
        updates.push('course = ?');
        params.push(course);
      }
      if (yearLevel) {
        updates.push('year_level = ?');
        params.push(yearLevel);
      }
      if (section) {
        updates.push('section = ?');
        params.push(section);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    query += updates.join(', ');
    query += ' WHERE id = ?';
    params.push(id);

    console.log('🔍 Update query:', query);
    console.log('📋 Update params:', params);

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    await logAuditAction(req.user.id, 'admin', 'UPDATE_VOTER', `Updated voter ID: ${id} (Active: ${isActive})`, req);

    console.log('✅ Voter updated successfully, ID:', id, 'Active status:', isActive);
    res.json({ message: 'Voter updated successfully' });
  } catch (error) {
    console.error('Update voter error:', error);
    console.log('❌ Update voter error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to update voter' });
  }
});

// ✅ NEW: Reset voting status for selected voters
router.patch('/reset-votes', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 Resetting voting status for selected voters by admin:', req.user.email || req.user.id);
    console.log('📦 Request body:', req.body);

    const { voterIds } = req.body;

    // Validation
    if (!voterIds) {
      return res.status(400).json({ error: 'voterIds field is required' });
    }

    if (!Array.isArray(voterIds)) {
      return res.status(400).json({ error: 'voterIds must be an array' });
    }

    if (voterIds.length === 0) {
      return res.status(400).json({ error: 'voterIds array must not be empty' });
    }

    // Convert all IDs to numbers to ensure they're valid
    const numericVoterIds = voterIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (numericVoterIds.length === 0) {
      return res.status(400).json({ error: 'No valid voter IDs provided' });
    }

    console.log('🔍 Resetting votes for voter IDs:', numericVoterIds);

    const placeholders = numericVoterIds.map(() => '?').join(',');
    const query = `UPDATE voters SET has_voted = false, voted_at = NULL WHERE id IN (${placeholders})`;
    const params = [...numericVoterIds];

    console.log('🔍 Reset votes query:', query);
    console.log('📋 Reset votes params:', params);

    const [result] = await pool.execute(query, params);

    await logAuditAction(req.user.id, 'admin', 'RESET_VOTES_SELECTED', `Reset voting status for ${result.affectedRows} selected voters (IDs: ${numericVoterIds.join(', ')})`, req);

    console.log('✅ Voting status reset successfully, affected:', result.affectedRows, 'voters');
    res.json({
      message: `${result.affectedRows} voter(s) voting status reset successfully`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('❌ Reset votes error:', error);
    res.status(500).json({ error: 'Failed to reset voting status: ' + error.message });
  }
});

// ✅ NEW: Reset voting status for ALL voters
router.patch('/reset-all-votes', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 Resetting voting status for ALL voters by admin:', req.user.email || req.user.id);

    const query = 'UPDATE voters SET has_voted = false, voted_at = NULL WHERE has_voted = true';
    
    console.log('🔍 Reset all votes query:', query);

    const [result] = await pool.execute(query);

    await logAuditAction(req.user.id, 'admin', 'RESET_VOTES_ALL', `Reset voting status for all ${result.affectedRows} voters`, req);

    console.log('✅ All voting status reset successfully, affected:', result.affectedRows, 'voters');
    res.json({
      message: `${result.affectedRows} voter(s) voting status reset successfully`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('❌ Reset all votes error:', error);
    res.status(500).json({ error: 'Failed to reset all voting status: ' + error.message });
  }
});

// ✅ FIX: BULK update voter status (activate/deactivate multiple voters) - MUST COME FIRST
router.patch('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 BULK updating voter status by admin:', req.user.email || req.user.id);
    console.log('📦 Request body:', req.body);

    const { voterIds, isActive } = req.body;

    // ✅ FIX: Better validation with detailed error messages
    if (!voterIds) {
      return res.status(400).json({ error: 'voterIds field is required' });
    }

    if (!Array.isArray(voterIds)) {
      return res.status(400).json({ error: 'voterIds must be an array' });
    }

    if (voterIds.length === 0) {
      return res.status(400).json({ error: 'voterIds array must not be empty' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive field is required and must be boolean' });
    }

    // Convert all IDs to numbers to ensure they're valid
    const numericVoterIds = voterIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (numericVoterIds.length === 0) {
      return res.status(400).json({ error: 'No valid voter IDs provided' });
    }

    console.log('🔍 Processing bulk update for voter IDs:', numericVoterIds);
    console.log('🔍 Setting is_active to:', isActive);

    const placeholders = numericVoterIds.map(() => '?').join(',');
    const query = `UPDATE voters SET is_active = ? WHERE id IN (${placeholders})`;
    const params = [isActive, ...numericVoterIds];

    console.log('🔍 Bulk update query:', query);
    console.log('📋 Bulk update params:', params);

    const [result] = await pool.execute(query, params);

    const action = isActive ? 'BULK_ACTIVATE_VOTERS' : 'BULK_DEACTIVATE_VOTERS';
    const actionText = isActive ? 'activated' : 'deactivated';

    await logAuditAction(req.user.id, 'admin', action, `${actionText} ${result.affectedRows} voters (IDs: ${numericVoterIds.join(', ')})`, req);

    console.log('✅ Bulk voter status update successful, affected:', result.affectedRows, 'voters, Active:', isActive);
    res.json({
      message: `${result.affectedRows} voter(s) ${actionText} successfully`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('❌ Bulk update voter status error:', error);
    res.status(500).json({ error: 'Failed to update voter status: ' + error.message });
  }
});

// ✅ FIX: INDIVIDUAL voter status update (activate/deactivate) - MUST COME AFTER BULK ROUTE
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 INDIVIDUAL voter status update - ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    console.log('📦 Request body:', req.body);
    
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive field is required and must be boolean' });
    }

    // Validate that ID is a number
    const voterId = parseInt(id);
    if (isNaN(voterId)) {
      return res.status(400).json({ error: 'Invalid voter ID' });
    }

    console.log('🔍 Individual update query: UPDATE voters SET is_active = ? WHERE id = ?');
    console.log('📋 Individual update params:', [isActive, voterId]);

    const [result] = await pool.execute(
      'UPDATE voters SET is_active = ? WHERE id = ?',
      [isActive, voterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    const action = isActive ? 'ACTIVATE_VOTER' : 'DEACTIVATE_VOTER';
    const actionText = isActive ? 'activated' : 'deactivated';
    
    await logAuditAction(req.user.id, 'admin', action, `${actionText} voter ID: ${voterId}`, req);

    console.log('✅ INDIVIDUAL voter status updated successfully, ID:', voterId, 'Active:', isActive);
    res.json({ message: `Voter ${actionText} successfully` });
  } catch (error) {
    console.error('❌ INDIVIDUAL voter status update error:', error);
    res.status(500).json({ error: 'Failed to update voter status: ' + error.message });
  }
});

// Delete voter
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('🗑️ Deleting voter ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM voters WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    await logAuditAction(req.user.id, 'admin', 'DELETE_VOTER', `Deleted voter ID: ${id}`, req);

    console.log('✅ Voter deleted successfully, ID:', id);
    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    console.error('Delete voter error:', error);
    console.log('❌ Delete voter error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to delete voter' });
  }
});

export default router;