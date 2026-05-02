# MySQL Server Optimization Guide for 50+ Desktop PCs

## Overview
This guide provides MySQL server configuration recommendations to support 50+ concurrent desktop PCs accessing the SSC Voting System.

## Critical MySQL Configuration (my.ini or my.cnf)

### Connection Settings
```ini
[mysqld]
# Maximum connections for 50+ PCs
max_connections = 200
max_user_connections = 150

# Connection timeout settings
wait_timeout = 300
interactive_timeout = 300
connect_timeout = 30

# Thread cache for faster connection handling
thread_cache_size = 50
table_open_cache = 2000
table_definition_cache = 1000
```

### Buffer Pool & Memory Settings (Adjust based on your server RAM)
```ini
# For a server with 8GB RAM:
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4
innodb_log_file_size = 512M
innodb_log_buffer_size = 64M

# For a server with 16GB RAM:
# innodb_buffer_pool_size = 8G
# innodb_buffer_pool_instances = 8
# innodb_log_file_size = 1G
# innodb_log_buffer_size = 128M

# Query cache (MySQL 5.7 and below)
query_cache_type = 1
query_cache_size = 256M
query_cache_limit = 4M

# Temporary tables
tmp_table_size = 128M
max_heap_table_size = 128M
```

### InnoDB Optimization
```ini
# InnoDB settings for high concurrency
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
innodb_read_io_threads = 8
innodb_write_io_threads = 8
innodb_thread_concurrency = 0  # Let InnoDB decide
innodb_lock_wait_timeout = 120
innodb_rollback_on_timeout = ON
```

### Network & Performance
```ini
# Network settings
max_allowed_packet = 64M
net_buffer_length = 1M
max_connect_errors = 100000

# Sort & join buffers
sort_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
join_buffer_size = 4M

# Query optimization
key_buffer_size = 256M
myisam_sort_buffer_size = 128M
```

### Logging (Minimal for Production)
```ini
# Error logging
log_error = mysql_error.log
log_warnings = 2

# Slow query log (enable for debugging)
slow_query_log = 1
slow_query_log_file = slow_queries.log
long_query_time = 2
log_queries_not_using_indexes = 0

# Binary logging (for replication/point-in-time recovery)
# Disable if not needed for performance
# log_bin = mysql-bin
# binlog_format = ROW
# expire_logs_days = 7
```

## Windows-Specific MySQL Configuration

### Location of my.ini on Windows
Typically located at:
- `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
- `C:\Program Files\MySQL\MySQL Server 8.0\my.ini`

### Windows Service Optimization
```ini
[mysqld]
# Windows-specific settings
skip-external-locking
enable-named-pipe
# shared-memory
# shared-memory-base-name=MYSQL
```

## Verification Commands

After applying configuration changes, verify with these commands:

```sql
-- Check max connections
SHOW VARIABLES LIKE 'max_connections';

-- Check current connections
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- Check buffer pool size
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- Check query cache (MySQL 5.7)
SHOW VARIABLES LIKE 'query_cache%';
```

## Connection Pool Monitoring

Add this to your MySQL configuration to help monitor connection usage:

```ini
[mysqld]
# Performance schema for monitoring
performance_schema = ON
```

Query to monitor connections:
```sql
-- View current connections by user
SELECT user, host, db, command, state 
FROM information_schema.processlist 
WHERE user != 'system user';

-- View connection statistics
SHOW STATUS LIKE '%thread%';
SHOW STATUS LIKE '%connect%';
```

## Recommended Actions for 50+ PCs

### 1. Restart MySQL with New Configuration
```bash
# Windows (as Administrator)
net stop MySQL80
net start MySQL80
```

### 2. Verify Connection Limits
```sql
-- Test maximum connections
SHOW VARIABLES LIKE 'max_connections';
-- Should show: 200
```

### 3. Monitor During Peak Usage
```sql
-- Run this during voting to check connection usage
SHOW STATUS LIKE 'Max_used_connections';
SHOW STATUS LIKE 'Threads_connected';
```

### 4. Database Maintenance
```sql
-- Optimize tables periodically
OPTIMIZE TABLE voters;
OPTIMIZE TABLE candidates;
OPTIMIZE TABLE vote_verification;

-- Analyze tables for query optimization
ANALYZE TABLE voters;
ANALYZE TABLE candidates;
```

## Quick Reference: Server Specifications

### Minimum Recommended Server Specs for 50+ PCs:
- **CPU**: 4 cores (8 threads)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: SSD with at least 50GB free
- **Network**: Gigabit Ethernet

### MySQL Version:
- MySQL 8.0 or MariaDB 10.6+ recommended
- MySQL 5.7 still supported with query cache

## Troubleshooting

### Issue: "Too many connections"
**Solution**: Increase `max_connections` to 200

### Issue: Slow queries during voting
**Solution**: 
1. Enable slow query log
2. Add indexes to frequently queried columns
3. Increase `innodb_buffer_pool_size`

### Issue: Connection timeouts
**Solution**: 
1. Increase `wait_timeout` to 300
2. Check network stability
3. Verify firewall settings

## Environment Variables for Application

Add to your `.env` file:
```
DB_CONNECTION_LIMIT=100
DB_QUEUE_LIMIT=500
DB_MAX_IDLE=50
DB_HOST=localhost
DB_PORT=3306
```

## Summary

With these optimizations, your MySQL server should handle:
- **200 concurrent connections**
- **50+ desktop PCs** simultaneously
- **Optimized buffer pools** for faster queries
- **Proper connection timeouts** for network stability

**Last Updated**: For 50 Desktop PC Network Deployment
