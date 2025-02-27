-- create a test user roleadmin, username: boji, pw: Admin123!

-- Create a test admin user with username: boji, password: Admin123!
INSERT INTO user_wa (
  username, 
  email, 
  password_hash, 
  role, 
  is_active, 
  is_email_verified
) VALUES (
  'boji', 
  'admin@wealtharc.com',
  -- This is the bcrypt hash for 'Admin123!'
  '$2a$10$XjGQ5yRMC6NZ.gO.ZpFq0OnftfHCdC./6TY3ZD7hUQkw8QGIpzZVS',
  'admin',
  TRUE,
  TRUE
);
