-- Create daily_menu table
CREATE TABLE daily_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    lunch_menu TEXT,
    dinner_menu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on date for fast daily lookup
CREATE INDEX idx_daily_menu_date ON daily_menu(date);
