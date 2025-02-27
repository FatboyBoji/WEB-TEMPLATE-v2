-- Create the database tables for the wealth arc application

-- Drop tables if they exist (useful for development)
DROP TABLE IF EXISTS user_sessions_wa;
DROP TABLE IF EXISTS user_wa;

-- Create user table
CREATE TABLE user_wa (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT
);

-- Create sessions table
CREATE TABLE user_sessions_wa (
  id UUID PRIMARY KEY,
  user_id INT NOT NULL,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  user_agent VARCHAR(500),
  ip_address VARCHAR(100),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_wa(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_user_wa_username ON user_wa(username);
CREATE INDEX idx_user_wa_email ON user_wa(email);
CREATE INDEX idx_user_sessions_wa_user_id ON user_sessions_wa(user_id);
CREATE INDEX idx_user_sessions_wa_refresh_token ON user_sessions_wa(refresh_token);


CREATE TABLE IF NOT EXISTS budget_items_wa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES user_wa(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  item_type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
  category VARCHAR(50) NOT NULL, -- 'fixed' or 'variable'
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS budget_items_user_id_idx ON budget_items_wa(user_id);
CREATE INDEX IF NOT EXISTS budget_items_month_year_idx ON budget_items_wa(month, year); 