-- Add phone and telegram_chat_id to customers
ALTER TABLE customers ADD COLUMN phone VARCHAR(20);
ALTER TABLE customers ADD COLUMN telegram_chat_id BIGINT;

-- Create index on phone for agent lookup
CREATE INDEX idx_customers_phone ON customers(phone);

-- Mess settings table for configurable auto-mark times
CREATE TABLE mess_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lunch_cutoff_time TIME NOT NULL DEFAULT '12:00',
    dinner_cutoff_time TIME NOT NULL DEFAULT '20:00',
    auto_mark_enabled BOOLEAN NOT NULL DEFAULT true,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings row
INSERT INTO mess_settings (id, lunch_cutoff_time, dinner_cutoff_time, auto_mark_enabled, timezone)
VALUES (gen_random_uuid(), '12:00', '20:00', true, 'Asia/Kolkata');

-- Update CHECK constraints to include new enum values
ALTER TABLE attendance_logs DROP CONSTRAINT attendance_logs_action_check;
ALTER TABLE attendance_logs ADD CONSTRAINT attendance_logs_action_check 
    CHECK (action IN ('Skipped', 'Resumed', 'Paused', 'Present'));

ALTER TABLE attendance_logs DROP CONSTRAINT attendance_logs_source_check;
ALTER TABLE attendance_logs ADD CONSTRAINT attendance_logs_source_check 
    CHECK (source IN ('Bot', 'Manual', 'System'));
