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