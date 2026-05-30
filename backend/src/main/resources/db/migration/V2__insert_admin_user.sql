-- Insert default admin user (password: admin123 - change in production!)
-- Password is bcrypt encoded: admin123
INSERT INTO users (id, username, email, password, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin',
    'admin@example.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EO', -- admin123
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_ADMIN' FROM users WHERE username = 'admin';
