-- StudySync Database Implementation

-- Create the database
DROP DATABASE IF EXISTS studysync;
CREATE DATABASE studysync;
USE studysync;

-- --------------------------------------------------------------------
-- CREATE TABLES
-- --------------------------------------------------------------------

-- Create University table
CREATE TABLE University (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255)
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
    FOREIGN KEY (university_id) REFERENCES University(university_id)
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
    FOREIGN KEY (university_id) REFERENCES University(university_id)
);

-- Create User_Course junction table (many-to-many)
CREATE TABLE User_Course (
    user_id INT,
    course_code VARCHAR(20),
    university_id INT,
    enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_code, university_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_code, university_id) REFERENCES Course(course_code, university_id) ON DELETE CASCADE
);

-- Create StudyGroup table
CREATE TABLE StudyGroup (
    study_group_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INT NOT NULL,
    course_code VARCHAR(20),
    university_id INT NOT NULL,
    max_capacity INT DEFAULT 8 NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES User(user_id),
    FOREIGN KEY (course_code, university_id) REFERENCES Course(course_code, university_id),
    CHECK (max_capacity BETWEEN 1 AND 8)
);

-- Create User_StudyGroup junction table (many-to-many)
CREATE TABLE User_StudyGroup (
    user_id INT,
    study_group_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, study_group_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (study_group_id) REFERENCES StudyGroup(study_group_id) ON DELETE CASCADE
);

-- Create Meeting table
CREATE TABLE Meeting (
    meeting_id INT AUTO_INCREMENT PRIMARY KEY,
    study_group_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    meeting_date DATE,                  -- For one-time meetings
    start_date DATE,                    -- For recurring meetings
    end_date DATE,                      -- For recurring meetings
    recurrence_days VARCHAR(20),        -- Store days as comma-separated values (e.g., "2,4" for Tue,Thu)
    FOREIGN KEY (study_group_id) REFERENCES StudyGroup(study_group_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES User(user_id),
    CONSTRAINT chk_dates CHECK (
        (is_recurring = FALSE AND meeting_date IS NOT NULL) OR
        (is_recurring = TRUE AND start_date IS NOT NULL)
    )
);


-- Create Tags table
CREATE TABLE Tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create many-to-many relationship table for StudyGroup and Tags
CREATE TABLE StudyGroup_Tags (
    study_group_id INT,
    tag_id INT,
    PRIMARY KEY (study_group_id, tag_id),
    FOREIGN KEY (study_group_id) REFERENCES StudyGroup(study_group_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

-- Create GroupJoinRequests table
CREATE TABLE GroupJoinRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    study_group_id INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    response_date TIMESTAMP,
    response_message TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (study_group_id) REFERENCES StudyGroup(study_group_id) ON DELETE CASCADE
);

-- Create Achievements table
CREATE TABLE Achievements (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_platform_default BOOLEAN DEFAULT TRUE,
    group_id INT
);

-- Create UserAchievements junction table (many-to-many)
CREATE TABLE UserAchievements (
    user_id INT,
    achievement_id INT,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES Achievements(achievement_id) ON DELETE CASCADE
);

CREATE TABLE Notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- INSERT STATEMENTS FOR INITIAL DATA
-- --------------------------------------------------------------------

-- Insert Universities
INSERT INTO University (name, location) VALUES
('University of California, Berkeley', 'Berkeley, CA'),
('Stanford University', 'Stanford, CA'),
('Massachusetts Institute of Technology', 'Cambridge, MA'),
('Harvard University', 'Cambridge, MA'),
('University of Washington', 'Seattle, WA');

-- Insert Users (passwords are hashed versions of 'password123')
INSERT INTO User (email, password, first_name, last_name, bio, university_id) VALUES
('alice@berkeley.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Alice', 'Johnson', 'Computer Science major interested in AI', 1),
('bob@stanford.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Bob', 'Smith', 'Math enthusiast and study group organizer', 2),
('charlie@mit.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Charlie', 'Brown', 'Engineering student focused on robotics', 3),
('diana@harvard.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Diana', 'Prince', 'Pre-med student looking for study partners', 4),
('evan@uw.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Evan', 'Williams', 'Business and Computer Science double major', 5),
('frank@uw.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Frank', 'Miller', 'Physics major', 5),
('grace@berkeley.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Grace', 'Lee', 'Chemistry student', 1),
('henry@stanford.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Henry', 'Garcia', 'Economics major', 2);

-- Insert Courses
INSERT INTO Course (course_code, university_id, name, semester, description, course_type) VALUES
('CS61A', 1, 'Structure and Interpretation of Computer Programs', 'Fall 2023', 'Introduction to programming and computer science', 'Core'),
('MATH51', 2, 'Linear Algebra and Differential Calculus', 'Winter 2023', 'Fundamentals of linear algebra and calculus', 'Core'),
('6.006', 3, 'Introduction to Algorithms', 'Spring 2023', 'Algorithm design and analysis', 'Core'),
('CS50', 4, 'Introduction to Computer Science', 'Fall 2023', 'Intro computer science course', 'Elective'),
('INFO340', 5, 'Client-Side Development', 'Spring 2023', 'Web development wcith JavaScript and frameworks', 'Core');

-- Insert User_Course relationships (enrollments)
INSERT INTO User_Course (user_id, course_code, university_id) VALUES
(1, 'CS61A', 1),
(2, 'MATH51', 2),
(3, '6.006', 3),
(4, 'CS50', 4),
(5, 'INFO340', 5),
(1, 'MATH51', 2),  -- Alice is also taking a course at Stanford
(2, 'CS61A', 1);  -- Bob is also taking a course at Berkeley

-- Insert StudyGroups
INSERT INTO StudyGroup (name, description, owner_id, course_code, university_id, max_capacity, is_private, created_at) VALUES
('CS61A Study Buddies', 'Group for working through CS61A problem sets', 1, 'CS61A', 1, 6, FALSE, '2023-09-01 10:00:00'),
('MATH51 Warriors', 'Collaborative group for MATH51 homework', 2, 'MATH51', 2, 8, FALSE, '2023-09-02 11:30:00'),
('Algorithms Club', 'Advanced study group for 6.006', 3, '6.006', 3, 4, TRUE, '2023-09-03 14:15:00'),
('CS50 Harvard', 'Official study group for CS50 students', 4, 'CS50', 4, 5, FALSE, '2023-09-04 09:00:00'),
('Web Dev Masters', 'Group for INFO340 projects', 5, 'INFO340', 5, 8, FALSE, '2023-09-05 16:45:00');

-- Insert User_StudyGroup relationships (group memberships)
INSERT INTO User_StudyGroup (user_id, study_group_id) VALUES
(1, 1),  -- Alice in CS61A Study Buddies
(2, 2),  -- Bob in MATH51 Warriors
(3, 3),  -- Charlie in Algorithms Club
(4, 4),  -- Diana in CS50 Harvard
(5, 5),  -- Evan in Web Dev Masters
(1, 2),  -- Alice also in MATH51 Warriors
(2, 1);  -- Bob also in CS61A Study Buddies

-- Insert one-time Meetings
INSERT INTO Meeting (study_group_id, name, start_time, end_time, location, description, created_by, meeting_date, is_recurring) VALUES
(1, 'CS61A Midterm Review', '18:00:00', '20:00:00', 'Moffitt Library 4th Floor', 'Review for upcoming midterm exam', 1, '2023-10-15', FALSE),
(2, 'MATH51 Problem Session', '16:30:00', '18:30:00', 'Green Library Study Room 202', 'Work through practice problems together', 2, '2023-10-16', FALSE),
(3, 'Algorithms Study Session', '19:00:00', '21:00:00', 'Building 32 Room 144', 'Dynamic programming concepts', 3, '2023-10-17', FALSE),
(4, 'CS50 Office Hours', '14:00:00', '16:00:00', 'Science Center 101', 'TA-led help session', 4, '2023-10-18', FALSE),
(5, 'INFO340 Project Planning', '17:00:00', '19:00:00', 'Odegaard Library 3rd Floor', 'Plan group project deliverables', 5, '2023-10-19', FALSE);

-- Insert recurring meetings
INSERT INTO Meeting (study_group_id, name, start_time, end_time, location, description, created_by, is_recurring, start_date, end_date, recurrence_days) VALUES
(1, 'Weekly CS61A Study', '17:00:00', '19:00:00', 'Soda Hall 306', 'Weekly problem set collaboration', 1, TRUE, '2023-09-05', '2023-12-05', '2,4'), -- Tue, Thu
(2, 'MATH51 Discussion', '15:00:00', '17:00:00', 'Math Building 101', 'Weekly discussion section', 2, TRUE, '2023-09-06', '2023-12-06', '3'), -- Wed
(3, 'Algorithms Practice', '18:00:00', '20:00:00', 'Stata Center 32-144', 'Weekly algorithm practice', 3, TRUE, '2023-09-07', '2023-12-07', '5'), -- Fri
(4, 'CS50 Weekly Review', '13:00:00', '15:00:00', 'Sever Hall 113', 'Weekly lecture review', 4, TRUE, '2023-09-08', '2023-12-08', '1'), -- Mon
(5, 'Web Dev Lab Hours', '16:00:00', '18:00:00', 'CSE Building 403', 'Weekly project work time', 5, TRUE, '2023-09-09', '2023-12-09', '2,5'); -- Tue, Fri

-- TODO NAVANEETH: add insert statements to the tables you created (for initial data)

-- Insert Tags
INSERT INTO Tags (tag_id,name, description) VALUES
(1,'Quiet Study', 'A tag for meetings that are focused on quiet study or concentration'),
(2,'Exam Prep', 'A tag for meetings that are focused on preparing for exams'),
(3,'Social', 'A tag for meetings that involve socializing or networking'),
(4,'Homework', 'A tag for meetings dedicated to working on homework or assignments'),
(5,'Project Work', 'A tag for meetings focused on collaborative project work');

-- Insert StudyGroup_Tags (many-to-many relationship between StudyGroup and Tags)
INSERT INTO StudyGroup_Tags (study_group_id, tag_id) VALUES
(1, 1),  -- CS61A Midterm Review tagged as Quiet Study
(1, 2),  -- CS61A Midterm Review tagged as Exam Prep
(2, 4),  -- MATH51 Problem Session tagged as Homework
(3, 1),  -- Algorithms Study Session tagged as Quiet Study
(3, 5),  -- Algorithms Study Session tagged as Project Work
(4, 3),  -- CS50 Office Hours tagged as Social
(5, 4),  -- INFO340 Project Planning tagged as Homework
(5, 5),  -- Weekly CS61A Study tagged as Project Work
(4, 1);  -- MATH51 Discussion tagged as Quiet Study

-- Insert GroupJoinRequests
INSERT INTO GroupJoinRequests (user_id, study_group_id, request_date, status, response_date, response_message) VALUES
(5, 3, '2023-09-15 10:30:00', 'pending', NULL, NULL),  -- Evan requests to join Algorithms Club
(1, 3, '2023-09-15 11:00:00', 'approved', '2023-09-16 12:00:00', 'Welcome to the club, Alice!'),  -- Alice approved for Algorithms Club
(2, 4, '2023-09-16 14:15:00', 'rejected', '2023-09-17 13:30:00', 'Sorry, the group is full at the moment.'),  -- Bob rejected for CS50 Harvard
(4, 2, '2023-09-17 09:00:00', 'pending', NULL, NULL);  -- Diana requests to join MATH51 Warriors

-- Insert Achievements
INSERT INTO Achievements (name, description, is_platform_default) VALUES
('Social Butterfly', 'Awarded for completing all assignments in CS61A', TRUE),
('Most Consistent', 'Awarded for solving 100+ MATH51 problems', TRUE),
('Algorithm Master', 'Awarded for exceptional performance in algorithm implementations', TRUE);

-- Insert UserAchievements (many-to-many relationship between Users and Achievements)
INSERT INTO UserAchievements (user_id, achievement_id) VALUES
(1, 1), 
(2, 2), 
(3, 3);

INSERT INTO Notifications (user_id, message) 
VALUES 
    (1, 'Your account has been successfully created.'),
    (2, 'Your profile was updated successfully.'),
    (3, 'You have a new message from the admin.'),
    (4, 'Your subscription is about to expire. Please renew soon.'),
    (5, 'You have a new friend request.');
        INSERT INTO Notifications (user_id, message) 
VALUES 
    (6, 'Your account has been successfully created.'),
    (7, 'Your profile was updated successfully.'),
    (8, 'You have a new friend request.');


-- ====================================================================
-- DATABASE PROGRAMMING OBJECTS
-- ====================================================================

-- I. Database Functions
/*
    Function: Checks if a user is a member of a specific study group
    Example usage: SELECT fn_IsUserInGroup(1, 2); -- Check if user with ID 1 is in study group with ID 2
*/ 

DELIMITER //

CREATE FUNCTION fn_IsUserInGroup(p_user_id INT, p_group_id INT) 
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE is_member BOOLEAN;
    
    -- Check if the user exists in the User_StudyGroup junction table for the given group
    SELECT COUNT(*) > 0 INTO is_member
    FROM User_StudyGroup
    WHERE user_id = p_user_id AND study_group_id = p_group_id;
    
    RETURN is_member;
END//

DELIMITER ;


/*
    Function: fn_GetGroupMemberCount - Get current member count for a group
    Example usage: SELECT fn_GetGroupMemberCount(2); -- Get the number of members in study group with ID 2
*/

DELIMITER //

CREATE FUNCTION fn_GetGroupMemberCount(p_group_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE member_count INT;
    
    -- Count the number of users in the specified study group
    SELECT COUNT(*) INTO member_count
    FROM User_StudyGroup
    WHERE study_group_id = p_group_id;
    
    RETURN member_count;
END//

DELIMITER ;

-- II. Stored Procedures
/*
    Stored Procedure #1: sp_RegisterUser - Handle user registration
*/

DELIMITER //

CREATE PROCEDURE sp_RegisterUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_bio TEXT,
    IN p_university_id INT
)
BEGIN
    DECLARE v_user_exists INT;
    
    -- Check if user already exists with this email
    SELECT COUNT(*) INTO v_user_exists
    FROM User
    WHERE email = p_email;
    
    IF v_user_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User with this email already exists';
    ELSE
        -- Insert the new user
        INSERT INTO User (email, password, first_name, last_name, bio, university_id)
        VALUES (p_email, p_password, p_first_name, p_last_name, p_bio, p_university_id);
        
        -- Return user_id of newly created user
        SELECT LAST_INSERT_ID() AS user_id;
    END IF;
END//

DELIMITER ;

/*
    Stored Procedure: sp_GetUserProfile - Retrieves complete user profile  
*/
DELIMITER //

CREATE PROCEDURE sp_GetUserProfile(
    IN p_user_id INT
)
BEGIN
    -- Get user basic info
    SELECT u.user_id, u.email, u.first_name, u.last_name, u.bio, 
           u.university_id, univ.name AS university_name
    FROM User u
    LEFT JOIN University univ ON u.university_id = univ.university_id
    WHERE u.user_id = p_user_id;
    
    -- Get user's achievements
    SELECT a.achievement_id, a.name, a.description
    FROM Achievements a
    JOIN UserAchievements ua ON a.achievement_id = ua.achievement_id
    WHERE ua.user_id = p_user_id;
    
    -- Get user's study groups
    SELECT sg.study_group_id, sg.name, sg.course_code, sg.is_private,
           sg.owner_id = p_user_id AS is_owner,
           c.name AS course_name
    FROM StudyGroup sg
    JOIN User_StudyGroup usg ON sg.study_group_id = usg.study_group_id
    LEFT JOIN Course c ON sg.course_code = c.course_code AND sg.university_id = c.university_id
    WHERE usg.user_id = p_user_id;
    
    -- Get user's enrolled courses
    SELECT c.course_code, c.name, c.semester, c.description
    FROM Course c
    JOIN User_Course uc ON c.course_code = uc.course_code AND c.university_id = uc.university_id
    WHERE uc.user_id = p_user_id;
END//

DELIMITER ;


/*
    Stored Procedure: sp_CreateStudyGroup - Create study group with validation   
*/

DELIMITER //

CREATE PROCEDURE sp_CreateStudyGroup(
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_owner_id INT,
    IN p_course_code VARCHAR(20),
    IN p_university_id INT,
    IN p_max_capacity INT,
    IN p_is_private BOOLEAN,
    OUT p_group_id INT
)
BEGIN
    DECLARE v_max_capacity INT;
    
    -- Start a transaction for consistency
    START TRANSACTION;
    
    -- Validate max_capacity
    IF p_max_capacity IS NULL OR p_max_capacity < 1 THEN
        SET v_max_capacity = 8; -- Default maximum
    ELSEIF p_max_capacity > 8 THEN
        SET v_max_capacity = 8; -- Cap at 8
    ELSE
        SET v_max_capacity = p_max_capacity;
    END IF;
    
    -- Create the study group
    INSERT INTO StudyGroup (name, description, owner_id, course_code, university_id, max_capacity, is_private)
    VALUES (p_name, p_description, p_owner_id, p_course_code, p_university_id, v_max_capacity, p_is_private);
    
    -- Get the ID of the newly created group
    SET p_group_id = LAST_INSERT_ID();
    
    -- Add the owner as a member of the group
    INSERT INTO User_StudyGroup (user_id, study_group_id)
    VALUES (p_owner_id, p_group_id);
    
    -- Commit the transaction
    COMMIT;
    
    -- Return the new study group details
    SELECT * FROM StudyGroup WHERE study_group_id = p_group_id;
END//

DELIMITER ;


/*
    Stored Procedure: sp_SearchStudyGroups - Search with filters (tags, course, etc.)    
    Example usage:
    CALL sp_SearchStudyGroups('CS61A', NULL, NULL); -- Search by course code
    CALL sp_SearchStudyGroups(NULL, 'Quiet Study', NULL); -- Search by tag
    CALL sp_SearchStudyGroups(NULL, NULL, 'Algorithms Club'); -- Search by study group name
*/

DELIMITER //

CREATE PROCEDURE sp_SearchStudyGroups(
    IN p_course_code VARCHAR(20),
    IN p_tag_name VARCHAR(100),
    IN p_studygroup_name VARCHAR(255)
)
BEGIN
    SELECT DISTINCT sg.study_group_id, sg.name, sg.description, sg.max_capacity, sg.is_private, sg.created_at, c.name AS course_name, u.name AS university_name
    FROM StudyGroup sg
    JOIN Course c ON sg.course_code = c.course_code AND sg.university_id = c.university_id
    JOIN University u ON sg.university_id = u.university_id
    LEFT JOIN Meeting_Tags mt ON sg.study_group_id = mt.meeting_id
    LEFT JOIN Tags t ON mt.tag_id = t.tag_id
    WHERE 
        (p_course_code IS NULL OR c.course_code = p_course_code)
        AND (p_tag_name IS NULL OR t.name = p_tag_name)
        AND (p_studygroup_name IS NULL OR sg.name = p_studygroup_name);
END//

DELIMITER ;

/*
    Stored Procedure: sp_ProcessJoinRequest - Handle group join request approval/rejection
    Example usage:
    CALL sp_ProcessJoinRequest(1, 3, 'approved', 'Welcome to the study group!');  -- Approve request
    CALL sp_ProcessJoinRequest(2, 4, 'rejected', 'Sorry, the group is full.');  -- Reject request
*/

DELIMITER //

CREATE PROCEDURE sp_ProcessJoinRequest(
    IN p_user_id INT,
    IN p_group_id INT,
    IN p_status ENUM('pending', 'approved', 'rejected'),
    IN p_response_message TEXT
)
BEGIN
    -- Update the request status and response message in the GroupJoinRequests table
    UPDATE GroupJoinRequests
    SET 
        status = p_status,
        response_date = CURRENT_TIMESTAMP,
        response_message = p_response_message
    WHERE user_id = p_user_id AND study_group_id = p_group_id;

    -- If the request is approved, add the user to the User_StudyGroup table
    IF p_status = 'approved' THEN
        INSERT INTO User_StudyGroup (user_id, study_group_id)
        VALUES (p_user_id, p_group_id);
    END IF;
END//

DELIMITER ;

/*
    Stored Procedure: sp_JoinStudyGroup - Handle the logic of joining a study group with proper validation
*/

DELIMITER //

CREATE PROCEDURE sp_JoinStudyGroup(
    IN p_user_id INT,
    IN p_group_id INT
)
BEGIN
    DECLARE v_is_private BOOLEAN;
    DECLARE v_current_members INT;
    DECLARE v_max_capacity INT;
    DECLARE v_already_member INT;
    DECLARE v_owner_id INT;
    
    -- Check if user is already a member
    SELECT COUNT(*) INTO v_already_member
    FROM User_StudyGroup
    WHERE user_id = p_user_id AND study_group_id = p_group_id;
    
    IF v_already_member > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is already a member of this group';
    END IF;
    
    -- Get group details
    SELECT is_private, 
           (SELECT COUNT(*) FROM User_StudyGroup WHERE study_group_id = p_group_id) as current_members,
           max_capacity,
           owner_id
    INTO v_is_private, v_current_members, v_max_capacity, v_owner_id
    FROM StudyGroup
    WHERE study_group_id = p_group_id;
    
    -- Check if group exists
    IF v_max_capacity IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Study group not found';
    END IF;
    
    -- Check if group is full
    IF v_current_members >= v_max_capacity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Study group is already at maximum capacity';
    END IF;
    
    -- Process based on privacy setting
    IF v_is_private THEN
        -- For private groups, create a join request
        INSERT INTO GroupJoinRequests (user_id, study_group_id)
        VALUES (p_user_id, p_group_id);
        
        -- Return result indicating request was created
        SELECT 'Join request submitted for private group' AS message, TRUE AS success;
    ELSE
        -- For public groups, add member directly
        INSERT INTO User_StudyGroup (user_id, study_group_id)
        VALUES (p_user_id, p_group_id);
        
        -- Return result indicating user joined
        SELECT 'Successfully joined public group' AS message, TRUE AS success;
    END IF;
END//

DELIMITER ;

/*
    Stored Procedure: sp_AwardAchievement - Award an achievement to a user with proper validation
*/

DELIMITER //

CREATE PROCEDURE sp_AwardAchievement(
    IN p_achievement_id INT,
    IN p_user_id INT,
    IN p_awarded_by INT
)
BEGIN
    DECLARE v_achievement_exists INT;
    DECLARE v_user_exists INT;
    DECLARE v_already_awarded INT;
    
    -- Validate achievement exists
    SELECT COUNT(*) INTO v_achievement_exists 
    FROM Achievements 
    WHERE achievement_id = p_achievement_id;
    
    IF v_achievement_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Achievement does not exist';
    END IF;
    
    -- Validate user exists
    SELECT COUNT(*) INTO v_user_exists 
    FROM User 
    WHERE user_id = p_user_id;
    
    IF v_user_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User does not exist';
    END IF;
    
    -- Check if already awarded
    SELECT COUNT(*) INTO v_already_awarded 
    FROM UserAchievements 
    WHERE achievement_id = p_achievement_id AND user_id = p_user_id;
    
    IF v_already_awarded > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Achievement already awarded to this user';
    END IF;
    
    -- Award the achievement
    INSERT INTO UserAchievements (user_id, achievement_id)
    VALUES (p_user_id, p_achievement_id);
    
    -- Create a notification
    INSERT INTO Notifications (user_id, message, status, created_at)
    VALUES (p_user_id, CONCAT('You have been awarded a new achievement!'), 'unread', CURRENT_TIMESTAMP);
    
    -- Return success confirmation
    SELECT 'Achievement awarded successfully' AS message;
END//

DELIMITER ;


-- III. Views
/*
    View: vw_StudyGroupWithMemberCount - Study groups with their current member counts
*/

CREATE VIEW vw_StudyGroupWithMemberCount AS
SELECT 
    sg.study_group_id,
    sg.name,
    sg.description,
    sg.owner_id,
    u.first_name AS owner_first_name,
    u.last_name AS owner_last_name,
    sg.course_code,
    c.name AS course_name,
    sg.university_id,
    univ.name AS university_name,
    sg.max_capacity,
    sg.is_private,
    sg.created_at,
    sg.updated_at,
    COUNT(usg.user_id) AS current_members
FROM StudyGroup sg
LEFT JOIN User u ON sg.owner_id = u.user_id
LEFT JOIN Course c ON sg.course_code = c.course_code AND sg.university_id = c.university_id
LEFT JOIN University univ ON sg.university_id = univ.university_id
LEFT JOIN User_StudyGroup usg ON sg.study_group_id = usg.study_group_id
GROUP BY sg.study_group_id;


/*
    View: vw_UserCourses - Shows users and their enrolled courses
*/


CREATE VIEW vw_UserCourses AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.bio,
    c.course_code,
    c.name AS course_name,
    c.semester,
    c.description AS course_description,
    c.course_type,
    un.name AS university_name
FROM User u
JOIN User_Course uc ON u.user_id = uc.user_id
JOIN Course c ON uc.course_code = c.course_code AND uc.university_id = c.university_id
JOIN University un ON c.university_id = un.university_id;


/*
    View: vw_UpcomingMeetings - Shows all scheduled upcoming meetings
*/

CREATE VIEW vw_UpcomingMeetings AS
SELECT 
    m.meeting_id,
    m.study_group_id,
    sg.name AS study_group_name,
    m.name AS meeting_name,
    m.start_time,
    m.end_time,
    m.location,
    m.description,
    m.is_recurring,
    m.meeting_date,
    m.start_date,
    m.end_date,
    m.recurrence_days
FROM Meeting m
JOIN StudyGroup sg ON m.study_group_id = sg.study_group_id
WHERE m.meeting_date >= CURRENT_DATE  -- Filters for meetings scheduled from today onward
   OR (m.is_recurring = TRUE AND m.start_date <= CURRENT_DATE AND m.end_date >= CURRENT_DATE);


/*
    View: vw_UserStatistics - Show users with their achievements
*/
CREATE VIEW vw_UserStatistics AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    -- Groups owned
    (SELECT COUNT(*) FROM StudyGroup WHERE owner_id = u.user_id) AS owned_groups_count,
    -- Groups joined (but not owned)
    (SELECT COUNT(*) 
     FROM User_StudyGroup usg 
     JOIN StudyGroup sg ON usg.study_group_id = sg.study_group_id 
     WHERE usg.user_id = u.user_id AND sg.owner_id != u.user_id) AS joined_groups_count,
    -- Meetings created
    (SELECT COUNT(*) FROM Meeting WHERE created_by = u.user_id) AS created_meetings_count,
    -- Achievements earned
    (SELECT COUNT(*) FROM UserAchievements WHERE user_id = u.user_id) AS achievement_count,
    -- Courses enrolled
    (SELECT COUNT(*) FROM User_Course WHERE user_id = u.user_id) AS course_count
FROM User u;

/*
    View: vw_UserAchievements - Show users with their achievements
*/

CREATE VIEW vw_UserAchievements AS
SELECT 
    ua.user_id,
    a.achievement_id,
    a.name, 
    a.description,
    a.is_platform_default,
    a.group_id
FROM Achievements a
JOIN UserAchievements ua ON a.achievement_id = ua.achievement_id;

/*
    View: vw_GroupMembersWithDetails - Shows detailed information about group members
*/


CREATE VIEW vw_GroupMembersWithDetails AS
SELECT 
    sg.study_group_id,
    sg.name AS group_name,
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.bio,
    univ.name AS university_name,
    sg.owner_id = u.user_id AS is_owner,
    usg.joined_at
FROM StudyGroup sg
JOIN User_StudyGroup usg ON sg.study_group_id = usg.study_group_id
JOIN User u ON usg.user_id = u.user_id
LEFT JOIN University univ ON u.university_id = univ.university_id;


-- IV. Triggers

DELIMITER //

CREATE TRIGGER tr_AfterJoinRequest
AFTER INSERT ON GroupJoinRequests
FOR EACH ROW
BEGIN
    DECLARE v_owner_id INT;
    DECLARE v_group_name VARCHAR(255);
    
    -- Lookup group owner ID from the StudyGroup table
    SELECT owner_id, name INTO v_owner_id, v_group_name
    FROM StudyGroup
    WHERE study_group_id = NEW.study_group_id;


    -- Insert a notification record for the group owner
    INSERT INTO Notifications (user_id, message, status, created_at)
    VALUES (v_owner_id,
            CONCAT('New join request for your study group: ', v_group_name), 
            'pending', CURRENT_TIMESTAMP);
    
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER tr_AfterJoinRequestStatusChange
AFTER UPDATE ON GroupJoinRequests
FOR EACH ROW
BEGIN
    DECLARE v_group_name VARCHAR(255);
    
    -- Only proceed if status has changed
    IF NEW.status != OLD.status THEN
        -- Get the study group name
        SELECT name INTO v_group_name
        FROM StudyGroup
        WHERE study_group_id = NEW.study_group_id;
        
        -- Insert notification for the requesting user
        INSERT INTO Notifications (user_id, message, status, created_at)
        VALUES (NEW.user_id,
                CONCAT('Your request to join ', v_group_name, ' has been ', LOWER(NEW.status)), 
                'unread', CURRENT_TIMESTAMP);
    END IF;
END//

DELIMITER ;

