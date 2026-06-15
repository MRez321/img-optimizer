CREATE TABLE users (
                       id CHAR(36) PRIMARY KEY,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NULL,        -- null if Google-only account
                       name VARCHAR(255) NULL,
                       avatar_url VARCHAR(512) NULL,
                       email_verified BOOLEAN DEFAULT FALSE,
                       role ENUM('user', 'admin') DEFAULT 'user',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE oauth_accounts (
                                id CHAR(36) PRIMARY KEY,
                                user_id CHAR(36) NOT NULL,
                                provider VARCHAR(50) NOT NULL,          -- 'google'
                                provider_user_id VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                UNIQUE KEY unique_provider_account (provider, provider_user_id)
);

CREATE TABLE refresh_tokens (
                                id CHAR(36) PRIMARY KEY,
                                user_id CHAR(36) NOT NULL,
                                token_hash VARCHAR(255) NOT NULL,        -- hashed, never store raw
                                expires_at TIMESTAMP NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                revoked BOOLEAN DEFAULT FALSE,
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE email_verifications (
                                     id CHAR(36) PRIMARY KEY,
                                     user_id CHAR(36) NOT NULL,
                                     code VARCHAR(10) NOT NULL,
                                     expires_at TIMESTAMP NOT NULL,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Optional, for "later":
ALTER TABLE sessions ADD COLUMN user_id CHAR(36) NULL,
  ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;