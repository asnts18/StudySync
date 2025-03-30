-- StudySync Database Implementation

-- Create the database
CREATE DATABASE IF NOT EXISTS studysync;
USE studysync;

-- --------------------------------------------------------------------
-- Core Tables - Abby's responsibility
-- --------------------------------------------------------------------

-- Create University table
CREATE TABLE University (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    UNIQUE KEY idx_university_name (name)
);

-- Create User table
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    university_id INT,
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES University(university_id),
    UNIQUE KEY idx_user_email (email)
);

-- Create Course table
CREATE TABLE Course (
    course_code VARCHAR(20),
    university_id INT,
    name VARCHAR(255) NOT NULL,
    semester VARCHAR(20),
    description TEXT,
    course_type VARCHAR(50),
    PRIMARY KEY (course_code, university_id),
    FOREIGN KEY (university_id) REFERENCES University(university_id),
    INDEX idx_course_name (name)
);

-- --------------------------------------------------------------------
-- Study Group & Meeting System - Navaneeth's responsibility
-- --------------------------------------------------------------------

-- TODO: Navaneeth - Create the following tables:
-- 1. Create StudyGroup table

-- 2. Create Meeting table

-- 3. Create Tags table and Meeting_Tag junction table

-- --------------------------------------------------------------------
-- Membership System - Abby's responsibility
-- --------------------------------------------------------------------

-- Create StudyGroupMember junction table
CREATE TABLE StudyGroupMember (
    user_id INT,
    study_group_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, study_group_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    -- FOREIGN KEY (study_group_id) REFERENCES StudyGroup(study_group_id) ON DELETE CASCADE
    -- TODO: Uncomment after Navaneeth creates the StudyGroup table
);

-- Create User_Course junction table
CREATE TABLE User_Course (
    user_id INT,
    course_code VARCHAR(20),
    university_id INT,
    enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_code, university_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_code, university_id) REFERENCES Course(course_code, university_id) ON DELETE CASCADE
);

-- Create GroupJoinRequests table
CREATE TABLE GroupJoinRequest (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    study_group_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    response_message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    -- FOREIGN KEY (study_group_id) REFERENCES StudyGroup(study_group_id),
    -- TODO: Uncomment after Navaneeth creates the StudyGroup table
    UNIQUE KEY idx_unique_request (user_id, study_group_id)
);

-- --------------------------------------------------------------------
-- Achievement System - Navaneeth's responsibility
-- --------------------------------------------------------------------

-- TODO: Navaneeth - Create the following tables:
-- 1. Create Achievement table

-- 2. Create UserAchievement junction table

-- --------------------------------------------------------------------
-- Database Functions - Shared responsibility
-- --------------------------------------------------------------------

-- Abby's function - GetGroupMemberCount
DELIMITER //

CREATE FUNCTION fn_GetGroupMemberCount(group_id INT) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE member_count INT;
    
    SELECT COUNT(*) INTO member_count
    FROM StudyGroupMember
    WHERE study_group_id = group_id;
    
    RETURN member_count;
END//

DELIMITER ;

-- TODO: Navaneeth - Create function fn_IsUserInGroup

-- --------------------------------------------------------------------
-- Test Data: Insert statements for initial data
-- --------------------------------------------------------------------

-- Abby's Test Data
-- Insert university data
INSERT INTO University (name, location) VALUES 
('Stanford University', 'Stanford, CA'),
('Massachusetts Institute of Technology', 'Cambridge, MA'),
('University of California, Berkeley', 'Berkeley, CA'),
('Harvard University', 'Cambridge, MA'),
('University of Washington', 'Seattle, WA');

-- Insert user data
INSERT INTO User (email, password, first_name, last_name, bio, university_id) VALUES 
('alice@example.com', '$2y$10$GxAZ7hQnKaJdalZzOjfOxuh9KgC14Jtq3e2vKjABzNhh1tU4GZwji', 'Alice', 'Johnson', 'Computer Science major interested in AI.', 1),
('bob@example.com', '$2y$10$M2JiZjVkMzY2MzQ2YjY3M.QrHoHHBgOHR9bAjWl7m1rpZd4f9Bnte', 'Bob', 'Smith', 'Physics graduate student focusing on quantum computing.', 2),
('charlie@example.com', '$2y$10$NWNjZTI3ZWM1YzIzMmVlZ.wh22ExE.cEwS2QOezgRxXaB7YpKkTyO', 'Charlie', 'Garcia', 'Biology major with a minor in data science.', 3),
('diana@example.com', '$2y$10$YTA2MTcyOGE4MTYyZjA5Y.RuE9N9I0Z5ydiQJEEXlqwMVFxwv3.8S', 'Diana', 'Lee', 'Mathematics PhD candidate researching graph theory.', 4),
('evan@example.com', '$2y$10$NjY0YWNlMTdkMjJlZmFiM.nTVY9s6SL0/3lmF65qwGz7XI9zY1OM2', 'Evan', 'Taylor', 'Computer Engineering student interested in robotics.', 5);

-- Insert course data
INSERT INTO Course (course_code, university_id, name, semester, description, course_type) VALUES
('CS101', 1, 'Introduction to Computer Science', 'Spring 2025', 'Fundamentals of programming and algorithmic thinking.', 'Undergraduate'),
('PHYS201', 2, 'Quantum Mechanics', 'Spring 2025', 'Introduction to quantum mechanics and wave functions.', 'Graduate'),
('BIO150', 3, 'Cell Biology', 'Spring 2025', 'Study of cellular structures and functions.', 'Undergraduate'),
('MATH301', 4, 'Graph Theory', 'Spring 2025', 'Mathematical structures to model pairwise relations.', 'Graduate'),
('CS244', 5, 'Robotics', 'Spring 2025', 'Introduction to robotics and autonomous systems.', 'Undergraduate');

-- Insert User_Course data (student enrollments)
INSERT INTO User_Course (user_id, course_code, university_id) VALUES
(1, 'CS101', 1),
(2, 'PHYS201', 2),
(3, 'BIO150', 3),
(4, 'MATH301', 4),
(5, 'CS244', 5);

-- TODO: Navaneeth - Insert test data for:
-- 1. Study groups (at least 1 per course, with mix of public and private)
-- 2. Tags (at least 5 common tags like "Quiet Study", "Exam Prep", etc.)
-- 3. Meetings (1-2 per study group)
-- 4. Meeting-Tag relationships
-- 5. Default platform-wide achievements
-- 6. Study group memberships (assign users to different study groups)
-- 7. Group join requests (for private groups)