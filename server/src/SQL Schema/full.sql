-- =============================================
-- Combined Migration Script
-- =============================================

-- 1. Update sessions status enum (if table already exists)
ALTER TABLE sessions
    MODIFY COLUMN status ENUM('pending', 'completed', 'abandoned') NOT NULL DEFAULT 'pending';

-- 2. Add expected_files column (if not exists)
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS expected_files INT NOT NULL DEFAULT 0 AFTER options;

-- 3. Add user_id column for authentication linking (if not exists)
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS user_id CHAR(36) NULL,
    ADD FOREIGN KEY IF NOT EXISTS fk_sessions_user
    (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- Create Authentication Tables
-- =============================================

CREATE TABLE IF NOT EXISTS users (
                                     id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,        -- null if Google-only
    name VARCHAR(255) NULL,
    avatar_url VARCHAR(512) NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS oauth_accounts (
                                              id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    provider VARCHAR(50) NOT NULL,          -- 'google'
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_account (provider, provider_user_id)
    );

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS email_verifications (
                                                   id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

-- =============================================
-- Sessions & Images Tables (Final Definition)
-- =============================================

CREATE TABLE IF NOT EXISTS sessions (
                                        id VARCHAR(36) PRIMARY KEY,
    user_id CHAR(36) NULL,
    folder_name VARCHAR(255) NOT NULL,
    upload_path VARCHAR(500) NOT NULL,
    optimized_path VARCHAR(500) NOT NULL,
    total_files INT DEFAULT 0,
    expected_files INT NOT NULL DEFAULT 0,
    total_original_size BIGINT DEFAULT 0,
    total_optimized_size BIGINT DEFAULT 0,
    status ENUM('pending', 'completed', 'abandoned') NOT NULL DEFAULT 'pending',
    options JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

CREATE TABLE IF NOT EXISTS images (
                                      id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    original_size BIGINT NOT NULL,
    optimized_name VARCHAR(255) NOT NULL,
    optimized_size BIGINT,
    format VARCHAR(10) NOT NULL,
    optimized_format VARCHAR(10) NOT NULL,
    savings_percentage DECIMAL(5,2) DEFAULT 0.00,
    width INT,
    height INT,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

-- =============================================
-- Auto Cleanup Event
-- =============================================

CREATE EVENT IF NOT EXISTS cleanup_old_sessions
ON SCHEDULE EVERY 1 HOUR
DO
DELETE FROM sessions
WHERE expires_at IS NOT NULL
  AND expires_at < NOW();