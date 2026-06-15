-- Migration: add expected_files column to sessions table
-- Run this against your existing img-optimizer database.

ALTER TABLE sessions
  ADD COLUMN expected_files INT NOT NULL DEFAULT 0 AFTER options;

-- Notes:
-- - "total_files" already exists and is incremented per processed image
--   (acts as "completed_files" - no new column needed for that).
-- - "expected_files" is set once at session creation (from client's
--   totalFiles value) and used to detect when a batch is complete.
-- - "last_active" already exists and is updated both by updateSessionStats
--   and now also by the socket heartbeat handler.
