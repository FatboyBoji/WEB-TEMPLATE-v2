-- Update the test user with a properly hashed password
UPDATE user_wa
SET password_hash = '$2a$10$XjGQ5yRMC6NZ.gO.ZpFq0OnftfHCdC./6TY3ZD7hUQkw8QGIpzZVS', 
    is_active = true, 
    role = 'admin',
    is_email_verified = true,
    failed_login_attempts = 0
WHERE username = 'boji';

-- If the user doesn't exist, create it
INSERT INTO user_wa (username, email, password_hash, role, is_active, is_email_verified)
SELECT 'boji', 'admin@wealtharc.com', '$2a$10$XjGQ5yRMC6NZ.gO.ZpFq0OnftfHCdC./6TY3ZD7hUQkw8QGIpzZVS', 'admin', true, true
WHERE NOT EXISTS (SELECT 1 FROM user_wa WHERE username = 'boji'); 