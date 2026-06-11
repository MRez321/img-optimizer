CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    folder_name VARCHAR(255) NOT NULL,
    upload_path VARCHAR(500) NOT NULL,
    optimized_path VARCHAR(500) NOT NULL,
    total_files INT DEFAULT 0,
    total_original_size BIGINT DEFAULT 0,
    total_optimized_size BIGINT DEFAULT 0,
    status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    options JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

CREATE TABLE images (
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

-- Auto cleanup (run via cron or event)
CREATE EVENT IF NOT EXISTS cleanup_old_sessions
ON SCHEDULE EVERY 1 HOUR
DO
  DELETE FROM sessions WHERE expires_at < NOW();