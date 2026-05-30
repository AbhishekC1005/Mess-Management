-- Secure default admin user by removing it
-- New administrators will register securely via the frontend registration page with the required registration passcode.
DELETE FROM users WHERE username = 'admin';
