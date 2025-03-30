-- StudySync Database Implementation

-- Create the database
CREATE DATABASE IF NOT EXISTS studysync;
USE studysync;

-- --------------------------------------------------------------------
-- CREATE TABLES
-- --------------------------------------------------------------------

-- Create University table
CREATE TABLE University (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    FOREIGN KEY (university_id) REFERENCES University(university_id),
);

-- Create Course table
CREATE TABLE Course (
    course_code VARCHAR(20),
    university_id INT,
    name VARCHAR(255) NOT NULL,
    semester VARCHAR(20),
    description TEXT,
    course_type VARCHAR(50),
    PRIMARY KEY (course_code, university_id)
    FOREIGN KEY (university_id) REFERENCES University(university_id),
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
    meeting_date DATE NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_group_id) REFERENCES StudyGroup(study_group_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES User(user_id)
);

-- TODO NAVANEETH: Create Tags table
-- TODO NAVANEETH: Create Meeting_Tags (many-to-many relationship: Meeting and Tags tables)
-- TODO NAVANEETH: Create GroupJoinRequests table
-- TODO NAVANEETH: Create Achievements table
-- TODO NAVANEETH: Create UserAchievement table (many-to-many relationship: User and Achievements tables)

-- Notes: 
-- Make sure to create relationships between tables using Foreign Keys 

-- --------------------------------------------------------------------
-- TEST DATA: INSERT STATEMENTS FOR INITIAL DATA
-- --------------------------------------------------------------------

-- TODO ABBY: add insert statements to the tables you created
-- TODO NAVANEETH: add insert statements to the tables you created

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
/*
    Function #2: fn_GetGroupMemberCount - Get current member count for a group
    Example usage: [ADD]
*/

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
/*
    Stored Procedure #3: sp_SearchStudyGroups - Search with filters (tags, course, etc.)
    Example usage: [ADD]
*/
-- TODO NAVANEETH: 
/*
    Stored Procedure #4: sp_ProcessJoinRequest - Handle group join request approval/rejection
    Example usage: [ADD]
*/

-- III. Views (3)
-- TODO ABBY: 
/*
    View #1: vw_StudyGroupWithMemberCount - Study groups with their current member counts
    Example usage: [ADD]
*/

-- TODO NAVANEETH: 
/*
    View #2: vw_UserCourses - Shows users and their enrolled courses
    Example usage: [ADD]
*/

-- TODO NAVANEETH:
/*
    View #3: vw_UpcomingMeetings - Shows all scheduled upcoming meetings
    Example usage: [ADD]
*/

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
