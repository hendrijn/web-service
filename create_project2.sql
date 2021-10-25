-- Remove any existing database and user.
DROP DATABASE IF EXISTS project2;
DROP USER IF EXISTS project2_user@localhost;

-- Create Unforget database and user. Ensure Unicode is fully supported.
CREATE DATABASE project2  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER project2_user@localhost IDENTIFIED WITH mysql_native_password BY 'lingfield3*';
GRANT ALL PRIVILEGES ON project2.* TO project2_user@localhost;
