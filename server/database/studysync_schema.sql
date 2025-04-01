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
    university_id INT,
    max_capacity INT DEFAULT 8,
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

-- TODO NAVANEETH: Create Tags table
-- TODO NAVANEETH: Create Meeting_Tags (many-to-many relationship: Meeting and Tags tables)
-- TODO NAVANEETH: Create GroupJoinRequests table
-- TODO NAVANEETH: Create Achievements table
-- TODO NAVANEETH: Create UserAchievement table (many-to-many relationship: User and Achievements tables)

-- Create Tags table
CREATE TABLE Tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create many-to-many relationship table for Meeting and Tags
CREATE TABLE Meeting_Tags (
    meeting_id INT,
    tag_id INT,
    PRIMARY KEY (meeting_id, tag_id),
    FOREIGN KEY (meeting_id) REFERENCES Meeting(meeting_id) ON DELETE CASCADE,
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
    icon_url VARCHAR(255),         -- URL for an icon/image representing the achievement
    point_value INT DEFAULT 0,
    is_platform_default BOOLEAN DEFAULT TRUE,  -- Determines if it's a platform-wide achievement
    group_id INT,                  -- Can be NULL for platform-wide achievements, or tied to a specific group
    FOREIGN KEY (group_id) REFERENCES StudyGroup(study_group_id) ON DELETE CASCADE
);

-- Create UserAchievements junction table (many-to-many)
CREATE TABLE UserAchievements (
    user_id INT,
    achievement_id INT,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES Achievements(achievement_id) ON DELETE CASCADE
);


-- Notes: 
-- Make sure to create relationships between tables using Foreign Keys 

-- --------------------------------------------------------------------
-- TEST DATA: INSERT STATEMENTS FOR INITIAL DATA
-- --------------------------------------------------------------------
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
('evan@uw.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Evan', 'Williams', 'Business and Computer Science double major', 5);

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

-- Insert Meeting_Tags (many-to-many relationship between Meetings and Tags)
INSERT INTO Meeting_Tags (meeting_id, tag_id) VALUES
(1, 1),  -- CS61A Midterm Review tagged as Quiet Study
(1, 2),  -- CS61A Midterm Review tagged as Exam Prep
(2, 4),  -- MATH51 Problem Session tagged as Homework
(3, 1),  -- Algorithms Study Session tagged as Quiet Study
(3, 5),  -- Algorithms Study Session tagged as Project Work
(4, 3),  -- CS50 Office Hours tagged as Social
(5, 4),  -- INFO340 Project Planning tagged as Homework
(6, 5),  -- Weekly CS61A Study tagged as Project Work
(7, 1),  -- MATH51 Discussion tagged as Quiet Study
(8, 2);  -- Algorithms Practice tagged as Exam Prep

-- Insert GroupJoinRequests
INSERT INTO GroupJoinRequests (user_id, study_group_id, request_date, status, response_date, response_message) VALUES
(5, 3, '2023-09-15 10:30:00', 'pending', NULL, NULL),  -- Evan requests to join Algorithms Club
(1, 3, '2023-09-15 11:00:00', 'approved', '2023-09-16 12:00:00', 'Welcome to the club, Alice!'),  -- Alice approved for Algorithms Club
(2, 4, '2023-09-16 14:15:00', 'rejected', '2023-09-17 13:30:00', 'Sorry, the group is full at the moment.'),  -- Bob rejected for CS50 Harvard
(4, 2, '2023-09-17 09:00:00', 'pending', NULL, NULL);  -- Diana requests to join MATH51 Warriors

-- Insert Achievements
INSERT INTO Achievements (name, description, icon_url, point_value, is_platform_default, group_id) VALUES
('CS61A Completion', 'Awarded for completing all assignments in CS61A', 'https://example.com/cs61a_icon.png', 10, TRUE, NULL),  -- Platform-wide achievement
('MATH51 Problem Solver', 'Awarded for solving 100+ MATH51 problems', 'https://example.com/math51_icon.png', 5, TRUE, NULL),  -- Platform-wide achievement
('Algorithms Expert', 'Awarded for mastering algorithms concepts', 'https://example.com/algorithms_icon.png', 15, TRUE, NULL),  -- Platform-wide achievement
('CS50 Contributor', 'Awarded for contributing significantly to CS50 study groups', 'https://example.com/cs50_contributor_icon.png', 8, FALSE, 4),  -- Group-specific achievement for CS50 Harvard group
('Web Dev Master', 'Awarded for outstanding performance in INFO340', 'https://example.com/web_dev_icon.png', 12, FALSE, 5);  -- Group-specific achievement for Web Dev Masters group

-- Insert UserAchievements (many-to-many relationship between Users and Achievements)
INSERT INTO UserAchievements (user_id, achievement_id, earned_date) VALUES
(1, 1, '2023-12-01 10:00:00'),  -- Alice earns CS61A Completion
(2, 2, '2023-11-25 15:30:00'),  -- Bob earns MATH51 Problem Solver
(3, 3, '2023-11-20 17:45:00'),  -- Charlie earns Algorithms Expert
(4, 4, '2023-11-10 13:00:00'),  -- Diana earns CS50 Contributor
(5, 5, '2023-11-30 09:00:00');  -- Evan earns Web Dev Master


-- ====================================================================
-- DATABASE PROGRAMMING OBJECTS
-- ====================================================================

-- I. Database Functions (2)
/*
    Function #1: Checks if a user is a member of a specific study group
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

-- TODO NAVANEETH: 
-- Function #2: fn_GetGroupMemberCount - Get current member count for a group
/*
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

-- II. Stored Procedures (4)
-- TODO ABBY
/*
    Stored Procedure #1: sp_RegisterUser - Handle user registration
    Example usage: [ADD]
*/
-- TODO ABBY: 
/*
    Stored Procedure #2: sp_CreateStudyGroup - Create study group with validation   
    Example usage: [ADD]
*/


-- TODO NAVANEETH: 
-- Stored Procedure #3: sp_SearchStudyGroups - Search with filters (tags, course, etc.)
/*
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
DELIMITER //

CREATE PROCEDURE sp_SearchStudyGroups(
    IN p_course_code VARCHAR(20),
    IN p_university_name VARCHAR(255),
    IN p_tag_name VARCHAR(100),
    IN p_location VARCHAR(255),
    IN p_search_term VARCHAR(255),
    IN p_sort_by VARCHAR(50),        -- Sorting option: 'newest', 'most_popular'
    IN p_page INT,                   -- Page number for pagination
    IN p_page_size INT               -- Number of results per page
)
BEGIN
    -- Declare variable for dynamic SQL query
    SET @sql_query = 'SELECT sg.study_group_id, sg.name AS study_group_name, sg.description, 
                            sg.max_capacity, sg.is_private, sg.created_at, 
                            c.name AS course_name, u.name AS university_name, 
                            COUNT(ug.user_id) AS member_count
                      FROM StudyGroup sg
                      JOIN Course c ON sg.course_code = c.course_code AND sg.university_id = c.university_id
                      JOIN University u ON sg.university_id = u.university_id
                      LEFT JOIN User_StudyGroup ug ON sg.study_group_id = ug.study_group_id
                      LEFT JOIN Meeting_Tags mt ON sg.study_group_id = mt.meeting_id
                      LEFT JOIN Tags t ON mt.tag_id = t.tag_id
                      WHERE 1 = 1 '; -- Base condition for dynamic filtering

    -- Add filter for course_code if provided
    IF p_course_code IS NOT NULL THEN
        SET @sql_query = CONCAT(@sql_query, ' AND c.course_code = "', p_course_code, '"');
    END IF;

    -- Add filter for university_name if provided
    IF p_university_name IS NOT NULL THEN
        SET @sql_query = CONCAT(@sql_query, ' AND u.name LIKE "%', p_university_name, '%"');
    END IF;

    -- Add filter for tag_name if provided
    IF p_tag_name IS NOT NULL THEN
        SET @sql_query = CONCAT(@sql_query, ' AND t.name LIKE "%', p_tag_name, '%"');
    END IF;

    -- Add filter for location if provided
    IF p_location IS NOT NULL THEN
        SET @sql_query = CONCAT(@sql_query, ' AND sg.location LIKE "%', p_location, '%"');
    END IF;

    -- Add search term filter if provided
    IF p_search_term IS NOT NULL THEN
        SET @sql_query = CONCAT(@sql_query, ' AND (sg.name LIKE "%', p_search_term, '%" OR sg.description LIKE "%', p_search_term, '%")');
    END IF;

    -- Add sorting option
    IF p_sort_by = 'newest' THEN
        SET @sql_query = CONCAT(@sql_query, ' ORDER BY sg.created_at DESC');
    ELSEIF p_sort_by = 'most_popular' THEN
        SET @sql_query = CONCAT(@sql_query, ' ORDER BY member_count DESC');
    ELSE
        SET @sql_query = CONCAT(@sql_query, ' ORDER BY sg.created_at DESC'); -- Default to newest
    END IF;

    -- Add pagination using LIMIT and OFFSET
    SET @sql_query = CONCAT(@sql_query, ' LIMIT ', p_page_size, ' OFFSET ', (p_page - 1) * p_page_size);

    -- Prepare and execute the dynamic SQL
    PREPARE stmt FROM @sql_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//

DELIMITER ;
*/


-- Stored Procedure #4: sp_ProcessJoinRequest - Handle group join request approval/rejection
/*
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
DELIMITER //

CREATE PROCEDURE sp_ProcessJoinRequest(
    IN p_request_id INT,
    IN p_status ENUM('approved', 'rejected'),
    IN p_response_message TEXT
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_group_id INT;
    DECLARE v_group_capacity INT;
    DECLARE v_member_count INT;

    -- Verify if the request exists and is pending
    SELECT user_id, study_group_id 
    INTO v_user_id, v_group_id
    FROM GroupJoinRequests
    WHERE request_id = p_request_id AND status = 'pending';

    IF v_user_id IS NULL OR v_group_id IS NULL THEN
        -- If no pending request found, return an error
        SELECT 'Error: No pending request found with the given request_id.' AS message;
        LEAVE sp_ProcessJoinRequest;
    END IF;

    -- Check if the group has capacity for a new member
    SELECT max_capacity, 
           (SELECT COUNT(*) FROM User_StudyGroup WHERE study_group_id = v_group_id) AS member_count
    INTO v_group_capacity, v_member_count
    FROM StudyGroup
    WHERE study_group_id = v_group_id;

    IF p_status = 'approved' THEN
        IF v_member_count >= v_group_capacity THEN
            -- If the group has no capacity, return an error message
            SELECT 'Error: Study group is full, cannot add more members.' AS message;
            LEAVE sp_ProcessJoinRequest;
        END IF;

        -- If the request is approved, add the user to the User_StudyGroup table
        INSERT INTO User_StudyGroup (user_id, study_group_id)
        VALUES (v_user_id, v_group_id);

        -- Update the request status to approved
        UPDATE GroupJoinRequests
        SET 
            status = p_status,
            response_date = CURRENT_TIMESTAMP,
            response_message = p_response_message
        WHERE request_id = p_request_id;

        -- Return success message
        SELECT 'Success: User added to the study group.' AS message;
    ELSEIF p_status = 'rejected' THEN
        -- If the request is rejected, update the request status
        UPDATE GroupJoinRequests
        SET 
            status = p_status,
            response_date = CURRENT_TIMESTAMP,
            response_message = p_response_message
        WHERE request_id = p_request_id;

        -- Return rejection message
        SELECT 'Success: Request rejected.' AS message;
    END IF;
END//

DELIMITER ;
*/

-- III. Views (3)
-- TODO ABBY: 
/*
    View #1: vw_StudyGroupWithMemberCount - Study groups with their current member counts
    Example usage: [ADD]
*/

-- TODO NAVANEETH: 
-- View #2: vw_UserCourses - Shows users and their enrolled courses
/*
    Example usage:
    SELECT * FROM vw_UserCourses;  -- Get all users and their enrolled courses
    SELECT * FROM vw_UserCourses WHERE user_id = 1;  -- Get courses for user with ID 1
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


-- TODO NAVANEETH:
-- View #3: vw_UpcomingMeetings - Shows all scheduled upcoming meetings
/*
    Example usage:
    SELECT * FROM vw_UpcomingMeetings;  -- Get all upcoming meetings
    SELECT * FROM vw_UpcomingMeetings WHERE study_group_id = 1;  -- Get upcoming meetings for study group with ID 1
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


-- IV. Triggers (2)
-- TODO ABBY: 
/*
    Trigger #1: tr_AfterMeetingInsert - Update group activity statistics
    Example usage: [ADD]
*/
-- TODO NAVANEETH:
/*
    Trigger #2: tr_AfterJoinRequest - Notify group owner of new join requests
    Example usage: [ADD]
*/
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
    INSERT INTO Notifications (user_id, notification_type, message, status, created_at)
    VALUES (v_owner_id, 'join_request', 
            CONCAT('New join request for your study group: ', v_group_name), 
            'pending', CURRENT_TIMESTAMP);
    
    -- Update the request count statistics (optional, if you maintain a count of pending requests)
    UPDATE StudyGroup
    SET pending_requests_count = pending_requests_count + 1
    WHERE study_group_id = NEW.study_group_id;
    
END//

DELIMITER ;
