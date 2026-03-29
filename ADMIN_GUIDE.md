# SSC Voting System - Admin Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Admin Dashboard](#admin-dashboard)
3. [Voter Management](#voter-management)
4. [Candidate Management](#candidate-management)
5. [Poll Management](#poll-management)
6. [Election Monitoring](#election-monitoring)
7. [Reports and Exports](#reports-and-exports)
8. [System Administration](#system-administration)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is the SSC Voting System?
The SSC Voting System is a blockchain-based electronic voting platform designed for secure, transparent, and efficient student council elections. The system uses Ethereum blockchain technology to ensure vote integrity and immutability.

### Key Features
- **Blockchain Security**: All votes are stored on the blockchain for tamper-proof recording
- **Dual-Node Architecture**: High availability with automatic failover
- **Real-time Monitoring**: Live vote counting and system status
- **Role-based Access**: Different permission levels for admins and super admins
- **Comprehensive Reporting**: Multiple export formats for audit trails

### System Architecture
- **Frontend**: Modern React-based web interface
- **Backend**: Node.js server with optimized performance
- **Database**: MySQL for voter/candidate data
- **Blockchain**: Ethereum smart contracts for vote storage
- **Dual Nodes**: Node1 (Primary) and Node2 (Secondary) for redundancy

---

## Admin Dashboard

### Accessing the Admin Dashboard
1. Navigate to the voting system URL
2. Click the hidden admin button (top-right corner)
3. Enter admin credentials:
   - **Email**: Your admin email address
   - **Password**: Your admin password

### Dashboard Overview
The dashboard provides a comprehensive view of the election system with:

#### Key Metrics Display
- **Total Voters**: Number of registered voters
- **Voters Who Voted**: Count of voters who have cast votes
- **Total Candidates**: Number of registered candidates
- **Total Votes Cast**: Real-time vote count from blockchain

#### System Status Indicators
- **Poll Status**: Active, Paused, Finished, or Not Started
- **Blockchain Status**: Connection status and node health
- **Server Health**: System performance metrics

#### Quick Actions
- **Start/Stop/Pause Poll**: Control voting periods
- **Export Data**: Download reports and logs
- **View Elections**: Access election history

### Navigation Menu
The admin interface consists of five main sections:

1. **Dashboard** - System overview and controls
2. **Admin Management** - Manage administrator accounts
3. **Candidates** - Manage candidates and positions
4. **Voters** - Manage voter registration and data
5. **Monitor** - Real-time election monitoring

---

## Voter Management

### Voter Registration

#### Adding Individual Voters
1. Navigate to **Voters** section
2. Click **"Add Voter"** button
3. Fill in the required information:
   - **Student ID**: Unique student identifier
   - **Full Name**: Complete student name
   - **Course**: Academic program/course
   - **Year Level**: 1st, 2nd, 3rd, or 4th year
   - **Section**: Class section
   - **Password**: Auto-generated based on student info
4. Set **Active Status** (enabled by default)
5. Click **"Create Voter"**

#### Bulk Voter Import
1. Click **"Import Voters"** button
2. Select file format (Excel, Word, or CSV)
3. Upload file containing voter data
4. Review import preview:
   - **New Voters**: Will be added to system
   - **Duplicates**: Already exist in system
   - **Errors**: Data issues that need fixing
5. Resolve any errors and confirm import

### Voter Information Management

#### Editing Voter Details
**Note**: Edit permissions vary based on poll status:

- **Before Poll Starts**: Can edit all fields
- **During Active Poll**: Can only edit passwords
- **After Poll Ends**: Can edit all fields

**To Edit a Voter:**
1. Find the voter using search or filters
2. Click the **Edit** icon (pencil)
3. Modify allowed fields
4. Click **"Update Voter"**

#### Voter Status Management
- **Active**: Voter can login and vote
- **Inactive**: Voter cannot access the system

**To Change Status:**
1. Select voters using checkboxes
2. Click **"Activate"** or **"Deactivate"** button
3. Confirm the action

### Voter Search and Filtering

#### Search Options
- **Student ID**: Search by ID number
- **Name**: Search by full name
- **Course**: Filter by academic program
- **Year Level**: Filter by year
- **Section**: Filter by class section
- **Voting Status**: Filter by voted/not voted
- **Active Status**: Filter by account status

#### Advanced Filtering
1. Use the **Filter** dropdown to access advanced options
2. Select multiple criteria for precise results
3. Apply filters to update the voter list

### Voter Export Capabilities

#### Export Features by Poll Status

**Before Poll Starts:**
- All voter information including passwords
- Complete voter details and status
- Registration data

**During Active Poll:**
- Voter information and passwords only
- Cannot export voting status (to maintain confidentiality)
- Live voter data

**After Poll Ends:**
- Complete voter information including passwords
- Voting status and timestamps
- Full election data

#### Export Process
1. Click **"Export Voters"** button
2. Configure export options:
   - **Select Fields**: Choose which data to include
   - **Filter Data**: Apply filters before export
   - **Format**: CSV format only
3. Click **"Generate Export"**
4. Download the generated CSV file

#### Export Fields Available
- **Student ID**: Unique identifier
- **Full Name**: Complete student name
- **Course**: Academic program
- **Year Level**: Academic year
- **Section**: Class section
- **Password**: Login credentials
- **Voting Status**: Whether they voted
- **Voted At**: Timestamp of vote
- **Registration Date**: When account was created
- **Active Status**: Account status

### Voter Vote Reset

#### Reset Individual Votes
1. Select specific voters
2. Click **"Reset Votes"** button
3. Confirm the action
4. Voters can vote again if poll is active

#### Reset All Votes
1. Click **"Reset All Votes"** button
2. Enter confirmation
3. All voters marked as not voted
4. **Use with caution**: This action cannot be undone

### Course Management

#### Adding Courses
1. Click **"Manage Courses"** button
2. Enter course details:
   - **Course Name**: Full course title
   - **Course Code**: Short identifier
3. Click **"Add Course"**

#### Deleting Courses
1. Click **"Manage Courses"**
2. Find the course in the list
3. Click **"Delete"** icon
4. Confirm deletion
   - **Note**: Cannot delete courses with assigned voters

---

## Candidate Management

### Position Management

#### Creating Positions
1. Navigate to **Candidates** section
2. Click **"Create Position"** button
3. Fill in position details:
   - **Position Name**: Title (e.g., President, Vice President)
   - **Maximum Votes**: Number of candidates voters can select
   - **Display Order**: Position order in ballot
   - **Active Status**: Enable/disable position
   - **Allowed Courses**: Restrict to specific courses (optional)
4. Click **"Create Position"**

#### Position Configuration Options
- **Maximum Votes**: 
  - 1 for single-winner positions (President, Treasurer)
  - Multiple for council positions (Senators)
- **Course Restrictions**: Limit voting to specific academic programs
- **Display Order**: Control ballot presentation sequence

### Candidate Registration

#### Adding Individual Candidates
1. Click **"Add Candidate"** button
2. Enter candidate information:
   - **Name**: Full candidate name
   - **Party**: Political party or affiliation
   - **Position**: Select from created positions
   - **Photo**: Upload candidate image (optional)
3. Click **"Create Candidate"**

#### Adding Candidates from Voter List
1. In the candidate creation form, start typing a name
2. Select from registered voters
3. Position and party information auto-populates
4. Confirm candidate creation

#### Candidate Image Upload
- **Supported Formats**: JPEG, PNG
- **Maximum Size**: 5MB
- **Recommended Size**: Square format for best display
- **Auto-fallback**: System generates avatar if no image uploaded

### Candidate Management Operations

#### Editing Candidates
**Note**: Editing is disabled during active voting to maintain integrity

1. Click the **Edit** icon next to candidate
2. Modify candidate details
3. Update image if needed
4. Click **"Update Candidate"**

#### Deleting Candidates
1. Click **Delete** icon
2. Confirm deletion
   - **Warning**: This removes all associated vote data
3. Candidate is permanently removed

#### Duplicate Prevention
- System prevents duplicate candidate names
- Real-time validation during entry
- Clear error messages for conflicts

### Position-Candidate Relationships

#### Managing Multiple Winners
- Configure positions for multiple winners (e.g., 3 Senators)
- Voters can select up to the maximum number
- System enforces selection limits

#### Course-Specific Positions
- Create positions restricted to certain courses
- Only voters from allowed courses can vote
- Useful for college-specific representatives

---

## Poll Management

### Poll Status Control

#### Understanding Poll States
- **Not Started**: Voting hasn't begun, voters cannot login
- **Active**: Voting is open, voters can cast ballots
- **Paused**: Voting temporarily suspended, voters cannot login
- **Finished**: Voting ended, no more votes accepted

#### Controlling Poll States

**Starting a Poll:**
1. Navigate to **Dashboard**
2. Ensure all candidates and voters are ready
3. Click **"Start Poll"** button
4. Confirm start action
5. Poll becomes active immediately

**Pausing a Poll:**
1. Click **"Pause Poll"** button
2. Provide reason (optional)
3. Confirm pause action
4. Voters cannot login during pause
5. Can be resumed anytime

**Finishing a Poll:**
1. Click **"Finish Poll"** button
2. Enter election details:
   - **Election Name**: Official title
   - **Election Date**: Voting date
   - **Academic Year**: Academic period
3. Confirm finish action
4. Results become final
5. Export final results

### Election Configuration

#### Setting Up New Elections
1. Ensure all positions are created
2. Register all candidates
3. Import or register all voters
4. Test system functionality
5. Start the poll when ready

#### Election Parameters
- **Duration**: No fixed time limit, controlled manually
- **Voter Access**: Based on active status and poll state
- **Security**: Blockchain-based vote storage
- **Integrity**: Real-time validation and monitoring

### Auto-Pause Feature

#### Blockchain Node Failure Detection
- System monitors blockchain node connectivity
- Automatic poll pause if both nodes fail
- Prevents voting during system outages
- Maintains election integrity

#### Recovery Process
1. Fix blockchain node issues
2. System auto-detects recovery
3. Manually resume poll if needed
4. Voting continues with restored functionality

---

## Election Monitoring

### Real-Time Vote Monitoring

#### Poll Monitor Interface
The Poll Monitor provides live election monitoring with:

**Key Metrics:**
- **Total Votes Cast**: Real-time blockchain vote count
- **Candidate Vote Counts**: Live results by position
- **Voter Turnout**: Percentage of eligible voters who voted
- **Blockchain Status**: Node connectivity and health

**Visual Indicators:**
- **Progress Bars**: Vote percentage visualization
- **Status Pills**: System health indicators
- **Color Coding**: Status-based visual feedback

#### Monitoring Features
- **Auto-Refresh**: 5-second update intervals
- **Fullscreen Mode**: Presentation-ready display
- **Mobile Responsive**: Monitor on any device
- **Export Capability**: Download live results

### Blockchain Status Monitoring

#### Node Health Indicators
- **Node1 Status**: Primary blockchain node
- **Node2 Status**: Secondary/backup node
- **Connection Status**: Online/Offline indicators
- **Block Information**: Current blockchain block number

#### Failover Monitoring
- **Automatic Switching**: Node1 → Node2 → Default
- **Status Logging**: Detailed failover events
- **Recovery Detection**: Automatic restoration monitoring

### Vote Counting Process

#### Blockchain Vote Retrieval
1. System queries blockchain nodes for vote data
2. Smart contract returns vote totals
3. Results processed and displayed in real-time
4. Data validated across multiple nodes

#### Result Accuracy
- **Immutable Storage**: Votes cannot be altered
- **Transparent Counting**: All calculations visible
- **Audit Trail**: Complete transaction history
- **Cross-Node Validation**: Multiple node verification

### Exporting Live Results

#### Real-Time Export
1. In Poll Monitor, click **"Export"** button
2. Generate JSON file with current results
3. Includes:
   - Vote counts by candidate
   - Percentage calculations
   - Blockchain verification data
   - System status information

#### Presentation Mode
- **Fullscreen Display**: Clean presentation interface
- **Auto-Refresh**: Live updates during presentation
- **Mobile Friendly**: Works on tablets and phones
- **Print-Friendly**: Optimized for printing results

---

## Reports and Exports

### Election History Management

#### Viewing Past Elections
1. Navigate to **Dashboard**
2. Click **"Election History"** button (Super Admin only)
3. Browse list of completed elections
4. View detailed results for any election

#### Election Details
- **Basic Information**: Name, date, academic year
- **Results**: Complete vote breakdowns
- **Statistics**: Turnout and participation data
- **Blockchain Hash**: Election integrity verification

### Export Formats and Options

#### Available Export Types
1. **JSON Format**: Structured data for developers
2. **CSV Format**: Spreadsheet-compatible data
3. **DOCX Format**: Word document reports

#### Export Categories

**Voter Data Exports:**
- **Complete Roster**: All voter information
- **Voting Status**: Who voted and when
- **Course Breakdown**: Voters by academic program
- **Password Lists**: Login credentials

**Election Results:**
- **Live Results**: Real-time vote counts
- **Final Results**: Certified election outcomes
- **Position Breakdown**: Results by office/position
- **Candidate Details**: Full candidate information

**Audit Logs:**
- **System Activity**: All admin actions
- **Login Attempts**: Security audit trail
- **Vote Submissions**: Blockchain transaction records
- **Error Logs**: System issues and resolutions

### Generating Exports

#### Step-by-Step Export Process
1. Navigate to the appropriate section
2. Click **"Export"** button
3. Select export format (JSON, CSV, DOCX)
4. Configure export options:
   - **Date Range**: Specific time periods
   - **Data Filters**: Include/exclude specific data
   - **Field Selection**: Choose data columns
5. Click **"Generate Export"**
6. Download the generated file

#### Export Customization
- **Field Selection**: Choose specific data columns
- **Date Filtering**: Export specific time periods
- **Status Filtering**: Include only active/inactive records
- **Search Filtering**: Export based on search criteria

### Audit Trail Management

#### What Gets Logged
- **User Logins**: All authentication attempts
- **Admin Actions**: Configuration changes
- **Vote Submissions**: Every vote cast
- **System Events**: Errors and recoveries
- **Data Changes**: All modifications to records

#### Audit Log Features
- **Timestamp**: Precise event timing
- **User Identification**: Who performed actions
- **Action Details**: What was changed
- **IP Address**: Network location
- **Success/Failure**: Operation outcomes

#### Exporting Audit Logs
1. In Dashboard, access audit logs
2. Click **"Export Audit Logs"**
3. Select export format and date range
4. Download comprehensive audit file

---

## System Administration

### Admin Account Management

#### Admin Roles and Permissions
- **Admin**: Basic administrative functions
- **Super Admin**: Full system access including election history

#### Managing Admin Accounts
1. Navigate to **Admin Management** section
2. View list of current administrators
3. Add new admins or modify existing ones
4. Set appropriate permission levels

#### Admin Security
- **Password Requirements**: Secure password policies
- **Login Tracking**: Monitor admin access
- **Session Management**: Automatic logout for inactivity

### System Health Monitoring

#### Performance Metrics
- **Memory Usage**: RAM consumption monitoring
- **CPU Load**: Processor utilization
- **Database Connections**: Connection pool status
- **Request Rate**: API endpoint usage

#### Health Check Features
- **Automatic Monitoring**: Continuous system checks
- **Alert System**: Notification for issues
- **Performance Optimization**: Automatic resource management
- **Error Recovery**: Automatic problem resolution

### Database Management

#### Data Integrity
- **Regular Backups**: Automated data protection
- **Consistency Checks**: Data validation processes
- **Transaction Logging**: Complete change history
- **Recovery Procedures**: Data restoration capabilities

#### Maintenance Operations
- **Data Cleanup**: Remove old/unnecessary data
- **Index Optimization**: Improve query performance
- **Connection Management**: Optimize database connections
- **Storage Monitoring**: Track disk usage

### Blockchain Node Management

#### Node Configuration
- **Primary Node (Node1)**: Main blockchain connection
- **Secondary Node (Node2)**: Backup and failover
- **Automatic Switching**: Seamless failover between nodes
- **Health Monitoring**: Continuous node status checking

#### Node Operations
- **Synchronization**: Keep nodes in sync
- **Recovery Procedures**: Restore failed nodes
- **Performance Monitoring**: Track node performance
- **Security Updates**: Maintain node security

---

## Troubleshooting

### Common Issues and Solutions

#### Voter Login Problems

**Issue**: Voter cannot login
**Solutions**:
1. Check if poll is active
2. Verify voter account is active
3. Confirm correct Student ID and password
4. Check for account lockout (wait 10 seconds)
5. Verify voter course eligibility

**Issue**: "Account Not Found" error
**Solutions**:
1. Verify Student ID exists in system
2. Check for typos in Student ID
3. Confirm voter registration completed
4. Contact admin if account needs creation

#### Voting Issues

**Issue**: Cannot submit vote
**Solutions**:
1. Check if poll is active (not paused)
2. Verify at least one candidate selected per position
3. Ensure browser compatibility
4. Check internet connection
5. Clear browser cache and cookies

**Issue**: Vote submission error
**Solutions**:
1. Check blockchain node status
2. Verify all selections are valid
3. Try submitting again
4. Contact admin if issue persists

#### System Performance Issues

**Issue**: Slow system response
**Solutions**:
1. Check server load
2. Verify database connections
3. Monitor memory usage
4. Check network connectivity
5. Restart if necessary (admin only)

**Issue**: Export failures
**Solutions**:
1. Check data size limits
2. Verify available disk space
3. Try different export format
4. Reduce data selection scope
5. Contact system administrator

### Emergency Procedures

#### System Outage Response
1. **Identify Issue**: Determine if it's frontend, backend, or blockchain
2. **Check Status**: Verify system health indicators
3. **Notify Users**: Communicate system status
4. **Implement Backup**: Activate failover systems
5. **Restore Service**: Recovery and testing procedures

#### Data Recovery
1. **Assess Impact**: Determine affected data
2. **Restore Backups**: Use recent database backups
3. **Verify Integrity**: Confirm data accuracy
4. **Update Systems**: Restore full functionality
5. **Document Incident**: Record for future prevention

### Contact and Support

#### Technical Support Contacts
- **System Administrator**: [Contact Information]
- **Blockchain Specialist**: [Contact Information]
- **Database Administrator**: [Contact Information]

#### Support Information Required
When reporting issues, provide:
- **Error Messages**: Exact text of any errors
- **Time of Issue**: When the problem occurred
- **Affected Users**: Who experienced the problem
- **Steps Taken**: What troubleshooting was attempted
- **System Status**: Current poll and system state

---

## Best Practices

### Election Setup Best Practices
1. **Plan Ahead**: Set up elections well in advance
2. **Test Thoroughly**: Verify all functionality before going live
3. **Backup Data**: Ensure all data is backed up
4. **Train Staff**: Make sure all admins understand the system
5. **Document Procedures**: Keep detailed setup instructions

### Security Best Practices
1. **Strong Passwords**: Use complex admin passwords
2. **Regular Monitoring**: Check system health daily
3. **Access Control**: Limit admin accounts to necessary personnel
4. **Audit Regularly**: Review system logs frequently
5. **Update Systems**: Keep software current and secure

### Voter Management Best Practices
1. **Clean Data**: Ensure voter information is accurate
2. **Import Testing**: Test data imports before full upload
3. **Password Security**: Distribute passwords securely
4. **Status Management**: Keep voter accounts updated
5. **Privacy Protection**: Protect voter personal information

---

## Quick Reference

### Keyboard Shortcuts
- **Ctrl + E**: Export current data (where available)
- **Ctrl + F**: Search in lists
- **Escape**: Close modals and dialogs
- **Enter**: Submit forms and confirm actions

### Common Tasks
1. **Start Election**: Dashboard → Start Poll
2. **Add Voter**: Voters → Add Voter
3. **Export Results**: Monitor → Export
4. **Pause Voting**: Dashboard → Pause Poll
5. **View Logs**: Dashboard → Audit Logs

### Important URLs
- **Main System**: [Your System URL]
- **Admin Access**: [Your System URL]?admin=true
- **API Documentation**: [Your System URL]/api/docs

---

This guide provides comprehensive instructions for administering the SSC Voting System. For additional assistance or technical support, please contact your system administrator.

**Last Updated**: [Current Date]
**Version**: [System Version]
