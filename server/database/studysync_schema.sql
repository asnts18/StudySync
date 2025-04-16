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
INSERT INTO Achievements (name, description, is_platform_dependent) VALUES
('Social Butterfly', 'Awarded for completing all assignments in CS61A', TRUE),
('Most Consistent', 'Awarded for solving 100+ MATH51 problems', TRUE);

-- Insert UserAchievements (many-to-many relationship between Users and Achievements)
INSERT INTO UserAchievements (user_id, achievement_id) VALUES
(1, 1), 
(2, 2), 
(3, 3);


