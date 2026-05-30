-- Create messes table
CREATE TABLE messes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default mess
INSERT INTO messes (id, name, location, address)
VALUES ('d3b07384-d113-495d-b003-7a91176b98a6', 'Campus Dining Hall', 'Hostel Block A', 'Campus Main Street');

-- Link users to messes
ALTER TABLE users ADD COLUMN mess_id UUID REFERENCES messes(id);
UPDATE users SET mess_id = 'd3b07384-d113-495d-b003-7a91176b98a6';
ALTER TABLE users ALTER COLUMN mess_id SET NOT NULL;

-- Link customers to messes
ALTER TABLE customers ADD COLUMN mess_id UUID REFERENCES messes(id);
UPDATE customers SET mess_id = 'd3b07384-d113-495d-b003-7a91176b98a6';
ALTER TABLE customers ALTER COLUMN mess_id SET NOT NULL;
ALTER TABLE customers ADD CONSTRAINT uq_mess_customer_phone UNIQUE (mess_id, phone);

-- Link daily_menu to messes
ALTER TABLE daily_menu DROP CONSTRAINT IF EXISTS daily_menu_date_key;
ALTER TABLE daily_menu ADD COLUMN mess_id UUID REFERENCES messes(id);
UPDATE daily_menu SET mess_id = 'd3b07384-d113-495d-b003-7a91176b98a6';
ALTER TABLE daily_menu ALTER COLUMN mess_id SET NOT NULL;
ALTER TABLE daily_menu ADD CONSTRAINT uq_mess_date UNIQUE (mess_id, date);

-- Link attendance_logs to messes
ALTER TABLE attendance_logs ADD COLUMN mess_id UUID REFERENCES messes(id);
UPDATE attendance_logs SET mess_id = 'd3b07384-d113-495d-b003-7a91176b98a6';
ALTER TABLE attendance_logs ALTER COLUMN mess_id SET NOT NULL;

-- Link mess_settings to messes
ALTER TABLE mess_settings ADD COLUMN mess_id UUID REFERENCES messes(id);
UPDATE mess_settings SET mess_id = 'd3b07384-d113-495d-b003-7a91176b98a6' WHERE mess_id IS NULL;
ALTER TABLE mess_settings ALTER COLUMN mess_id SET NOT NULL;
ALTER TABLE mess_settings ADD CONSTRAINT uq_mess_settings_mess UNIQUE (mess_id);
