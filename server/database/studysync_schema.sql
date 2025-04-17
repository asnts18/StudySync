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

-- Insert more Universities (Adding Boston schools)
-- Insert Universities
-- Insert Universities with specific IDs to match existing references
INSERT INTO University (university_id, name, location) VALUES
(1, 'University of California, Berkeley', 'Berkeley, CA'),
(2, 'Stanford University', 'Stanford, CA'),
(3, 'Massachusetts Institute of Technology', 'Cambridge, MA'),
(4, 'Harvard University', 'Cambridge, MA'),
(5, 'Princeton University', 'Princeton, NJ'),
(6, 'Boston University', 'Boston, MA'),
(7, 'Northeastern University', 'Boston, MA'),
(8, 'Boston College', 'Chestnut Hill, MA'),
(9, 'Tufts University', 'Medford, MA'),
(10, 'Emerson College', 'Boston, MA'),
(11, 'Suffolk University', 'Boston, MA'),
(12, 'Berklee College of Music', 'Boston, MA'),
(13, 'Simmons University', 'Boston, MA');

-- Insert additional Users (password should be hashed in real implementation)
-- Using the same hashed password as in original script: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG'
INSERT INTO User (email, password, first_name, last_name, bio, university_id) VALUES
-- Boston University students
('jordan@bu.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Jordan', 'Parker', 'Computer Science major focusing on AI and Machine Learning', 6),
('taylor@bu.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Taylor', 'Smith', 'Biology pre-med student with interest in research', 6),
('alex@bu.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Alex', 'Johnson', 'Business major with a minor in Computer Science', 6),
('morgan@bu.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Morgan', 'Williams', 'Linguistics major with interest in natural language processing', 6),

-- Northeastern University students
('casey@northeastern.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Casey', 'Brown', 'Engineering student specializing in robotics', 7),
('jamie@northeastern.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Jamie', 'Davis', 'Psychology major with research focus on cognitive development', 7),
('riley@northeastern.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Riley', 'Garcia', 'Information Science major with data analysis concentration', 7),
('avery@northeastern.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Avery', 'Martinez', 'Mechanical Engineering student interested in sustainable design', 7),

-- Boston College students
('quinn@bc.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Quinn', 'Rodriguez', 'Finance major with interest in investment banking', 8),
('sasha@bc.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Sasha', 'Wilson', 'Communications student focusing on digital media', 8),
('devon@bc.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Devon', 'Taylor', 'History major with minor in Political Science', 8),
('jordan@bc.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Jordan', 'Thomas', 'Biology major on pre-med track with genetics focus', 8),

-- Harvard University students (existing university in database)
('mike@harvard.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Mike', 'Anderson', 'Computer Science student with focus on algorithms', 4),
('sarah@harvard.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Sarah', 'Lee', 'Economics major with interest in behavioral economics', 4),
('james@harvard.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'James', 'White', 'Physics student researching quantum computing', 4),
('emma@harvard.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Emma', 'Clark', 'English literature major focusing on modern fiction', 4),

-- MIT students (existing university in database)
('david@mit.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'David', 'Chen', 'Computer Science with focus on cybersecurity', 3),
('olivia@mit.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Olivia', 'Khan', 'Mathematics major specializing in cryptography', 3),
('ethan@mit.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Ethan', 'Patel', 'Engineering student with interest in sustainable energy', 3),
('zoe@mit.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYVJY52J3R0fRmpVj3vL4G.fWrJzFG', 'Zoe', 'Nguyen', 'Biology major researching genetic engineering', 3);

-- Insert additional Courses for Boston schools
INSERT INTO Course (course_code, university_id, name, semester, description, course_type) VALUES
-- Boston University courses
('CS330', 6, 'Introduction to Algorithms', 'Fall 2024', 'Theoretical foundations of computer science and practical algorithm design', 'Core'),
('CS440', 6, 'Artificial Intelligence', 'Fall 2024', 'Introduction to AI principles and applications', 'Elective'),
('BIO315', 6, 'Molecular Biology', 'Spring 2024', 'Study of biological activity at the molecular level', 'Core'),
('BUS250', 6, 'Business Analytics', 'Fall 2024', 'Data-driven approach to business decision making', 'Core'),

-- Northeastern University courses
('EECE2150', 7, 'Circuits and Signals', 'Fall 2024', 'Fundamentals of electrical circuit analysis', 'Core'),
('CS3200', 7, 'Database Design', 'Spring 2024', 'Design and implementation of database systems', 'Core'),
('PSYC3404', 7, 'Developmental Psychology', 'Fall 2024', 'Human development across the lifespan', 'Core'),
('DS3000', 7, 'Foundations of Data Science', 'Fall 2024', 'Introduction to data science workflows and tools', 'Core'),

-- Boston College courses
('CSCI2227', 8, 'Introduction to Scientific Computation', 'Fall 2024', 'Scientific problem solving with computers', 'Core'),
('ECON2201', 8, 'Microeconomic Theory', 'Spring 2024', 'Analysis of economic decision-making by individuals and firms', 'Core'),
('HIST2180', 8, 'Modern American History', 'Fall 2024', 'American history from 1945 to present', 'Elective'),
('BIOL2000', 8, 'Molecules and Cells', 'Fall 2024', 'Basic principles of molecular and cellular biology', 'Core'),

-- Additional Harvard courses
('CS124', 4, 'Data Structures and Algorithms', 'Fall 2024', 'Fundamental algorithms and data structures', 'Core'),
('ECON1010', 4, 'Microeconomic Theory', 'Fall 2024', 'Analytical approach to the study of economics', 'Core'),
('PHYS16', 4, 'Mechanics and Special Relativity', 'Spring 2024', 'Classical mechanics and introduction to special relativity', 'Core'),
('ENGL197', 4, 'Contemporary Fiction', 'Fall 2024', 'Analysis of 21st century fiction works', 'Elective'),

-- Additional MIT courses
('6.046', 3, 'Design and Analysis of Algorithms', 'Fall 2024', 'Advanced algorithm design and analysis techniques', 'Core'),
('18.404', 3, 'Theory of Computation', 'Spring 2024', 'Mathematical foundation of theoretical computer science', 'Core'),
('2.007', 3, 'Design and Manufacturing', 'Fall 2024', 'Introduction to design and manufacturing in mechanical engineering', 'Core'),
('7.012', 3, 'Introductory Biology', 'Fall 2024', 'Fundamentals of molecular biology and genetics', 'Core');

-- Enroll users in courses
INSERT INTO User_Course (user_id, course_code, university_id) VALUES
-- Boston University students enrollments
(6, 'CS330', 6), (6, 'CS440', 6),
(7, 'BIO315', 6), (7, 'BUS250', 6),
(8, 'BUS250', 6), (8, 'CS330', 6),
(9, 'CS330', 6), (9, 'BIO315', 6),

-- Northeastern University students enrollments
(10, 'EECE2150', 7), (10, 'CS3200', 7),
(11, 'PSYC3404', 7), (11, 'DS3000', 7),
(12, 'DS3000', 7), (12, 'CS3200', 7),
(13, 'EECE2150', 7), (13, 'DS3000', 7),

-- Boston College students enrollments
(14, 'CSCI2227', 8), (14, 'ECON2201', 8),
(15, 'ECON2201', 8), (15, 'HIST2180', 8),
(16, 'HIST2180', 8), (16, 'CSCI2227', 8),
(17, 'BIOL2000', 8), (17, 'HIST2180', 8),

-- Harvard students enrollments
(1, 'CS124', 4), (1, 'PHYS16', 4),
(2, 'ECON1010', 4), (2, 'CS124', 4),
(3, 'PHYS16', 4), (3, 'CS124', 4),
(4, 'ENGL197', 4), (4, 'ECON1010', 4),

-- MIT students enrollments
(5, '6.046', 3), (5, '18.404', 3),
(6, '18.404', 3), (6, '7.012', 3),
(7, '2.007', 3), (7, '6.046', 3),
(8, '7.012', 3), (8, '2.007', 3);

INSERT INTO StudyGroup (name, description, owner_id, course_code, university_id, max_capacity, is_private, created_at) VALUES
-- Boston University study groups (university_id 6)
('CS330 Algorithm Masters', 'Advanced study group for CS330 algorithm design', 6, 'CS330', 6, 6, FALSE, '2024-01-15 10:00:00'),
('BIO315 Research Squad', 'Study group for molecular biology research projects', 7, 'BIO315', 6, 5, FALSE, '2024-01-16 14:30:00'),
('Business Analytics Group', 'Data-driven business decision making study sessions', 8, 'BUS250', 6, 8, FALSE, '2024-01-17 16:45:00'),

-- Northeastern University study groups (university_id 7)
('Circuit Breakers', 'Group for mastering electrical circuit analysis', 10, 'EECE2150', 7, 6, FALSE, '2024-01-18 11:00:00'),
('Database Design Crew', 'Collaborative group for database implementation projects', 11, 'CS3200', 7, 4, TRUE, '2024-01-19 15:30:00'),
('Data Science Explorers', 'Hands-on data science practice and projects', 12, 'DS3000', 7, 6, FALSE, '2024-01-20 13:15:00'),

-- Boston College study groups (university_id 8)
('Econ Theory Team', 'Group for economic theory problem solving', 14, 'ECON2201', 8, 6, FALSE, '2024-01-21 10:30:00'),
('Modern History Discussion', 'Discussion-based study group for modern American history', 15, 'HIST2180', 8, 8, FALSE, '2024-01-22 14:00:00'),
('BC Biology Lab Partners', 'Study group for biology lab preparation and review', 17, 'BIOL2000', 8, 4, TRUE, '2024-01-23 16:15:00'),

-- Harvard study groups (university_id 4)
('Harvard Algorithm Squad', 'Advanced algorithm design and analysis practice', 1, 'CS124', 4, 6, FALSE, '2024-01-24 09:30:00'),
('Quantum Physics Group', 'Theoretical and applied physics study sessions', 3, 'PHYS16', 4, 5, TRUE, '2024-01-25 11:45:00'),
('Harvard Economics Forum', 'Discussion-based economics study group', 2, 'ECON1010', 4, 8, FALSE, '2024-01-26 13:00:00'),

-- MIT study groups (university_id 3)
('MIT Algorithm Masters', 'Deep dive into advanced algorithm design', 5, '6.046', 3, 6, FALSE, '2024-01-27 10:15:00'),
('Computation Theory Group', 'Theoretical computer science study and problem solving', 18, '18.404', 3, 5, TRUE, '2024-01-28 14:45:00'),
('Biology Research Collective', 'Collaborative biology research and study sessions', 20, '7.012', 3, 6, FALSE, '2024-01-29 16:30:00');

-- Add members to Study Groups
INSERT INTO User_StudyGroup (user_id, study_group_id) VALUES
-- Boston University study groups (university_id 6)
-- StudyGroup 1 (CS330 Algorithm Masters) - Add the owner and other BU students
(6, 1), -- Owner is already added by trigger, but adding for clarity
(7, 1), 
(8, 1),
(9, 1),

-- StudyGroup 2 (BIO315 Research Squad) - Add BU students
(7, 2), -- Owner
(6, 2),
(9, 2),

-- StudyGroup 3 (Business Analytics Group) - Add BU students
(8, 3), -- Owner
(6, 3),
(9, 3),

-- Northeastern University study groups (university_id 7)
-- StudyGroup 4 (Circuit Breakers) - Add Northeastern students
(10, 4), -- Owner
(11, 4),
(12, 4),

-- StudyGroup 5 (Database Design Crew) - Add Northeastern students
(11, 5), -- Owner
(10, 5),
(13, 5),

-- StudyGroup 6 (Data Science Explorers) - Add Northeastern students
(12, 6), -- Owner
(10, 6),
(13, 6),

-- Boston College study groups (university_id 8)
-- StudyGroup 7 (Econ Theory Team) - Add BC students
(14, 7), -- Owner
(15, 7),
(16, 7),

-- StudyGroup 8 (Modern History Discussion) - Add BC students
(15, 8), -- Owner
(14, 8),
(16, 8),
(17, 8),

-- StudyGroup 9 (BC Biology Lab Partners) - Add BC students
(17, 9), -- Owner
(16, 9),

-- Harvard study groups (university_id 4)
-- StudyGroup 10 (Harvard Algorithm Squad) - Add Harvard students
(1, 10), -- Owner
(2, 10),
(3, 10),
(4, 10),

-- StudyGroup 11 (Quantum Physics Group) - Add Harvard students
(3, 11), -- Owner
(1, 11),
(4, 11),

-- StudyGroup 12 (Harvard Economics Forum) - Add Harvard students
(2, 12), -- Owner
(1, 12),
(4, 12),

-- MIT study groups (university_id 3)
-- StudyGroup 13 (MIT Algorithm Masters) - Add MIT students
(5, 13), -- Owner
(18, 13),
(19, 13),

-- StudyGroup 14 (Computation Theory Group) - Add MIT students
(18, 14), -- Owner
(5, 14),
(19, 14),
(20, 14),

-- StudyGroup 15 (Biology Research Collective) - Add MIT students
(20, 15), -- Owner
(5, 15),
(19, 15);

-- Add more Meetings for the new study groups
-- Add one-time meetings (without explicit meeting_id to allow auto-increment)
INSERT INTO Meeting (study_group_id, name, start_time, end_time, location, description, created_by, meeting_date, is_recurring) VALUES
-- Boston University meetings (study groups 1-3)
(1, 'Algorithm Final Review', '18:00:00', '20:00:00', 'Warren Towers Study Lounge', 'Comprehensive review for CS330 final exam', 6, '2024-05-01', FALSE),
(2, 'Molecular Biology Lab Prep', '16:00:00', '18:00:00', 'Life Sciences Building Room 202', 'Preparation for upcoming molecular biology lab experiment', 7, '2024-04-15', FALSE),
(3, 'Business Case Study Workshop', '17:00:00', '19:00:00', 'Questrom School of Business Room 302', 'Workshop to analyze recent business cases', 8, '2024-04-20', FALSE),

-- Northeastern University meetings (study groups 4-6)
(4, 'Circuit Design Workshop', '15:00:00', '17:00:00', 'Dana Research Center Room 125', 'Hands-on workshop for circuit design and analysis', 10, '2024-04-22', FALSE),
(5, 'Database Project Planning', '14:00:00', '16:00:00', 'Snell Library Study Room 4', 'Planning session for final database project', 11, '2024-04-25', FALSE),
(6, 'Data Visualization Session', '16:30:00', '18:30:00', 'West Village H Room 210', 'Workshop focusing on effective data visualization techniques', 12, '2024-04-28', FALSE),

-- Boston College meetings (study groups 7-9)
(7, 'Economics Problem Set Marathon', '13:00:00', '16:00:00', 'ONeill Library Room 303', 'Group session to work through difficult problem sets', 14, '2024-05-02', FALSE),
(8, 'History Essay Workshop', '14:30:00', '16:30:00', 'Stokes Hall Room S201', 'Peer review workshop for upcoming history essays', 15, '2024-05-05', FALSE),
(9, 'Biology Exam Prep', '17:00:00', '19:00:00', 'Higgins Hall Room 310', 'Comprehensive review for biology midterm', 17, '2024-04-18', FALSE);

-- Add recurring meetings (without explicit meeting_id to allow auto-increment)
INSERT INTO Meeting (study_group_id, name, start_time, end_time, location, description, created_by, is_recurring, start_date, end_date, recurrence_days) VALUES
-- Harvard recurring meetings (study groups 10-12)
(10, 'Weekly Algorithm Practice', '16:00:00', '18:00:00', 'Maxwell Dworkin Room 119', 'Weekly algorithm problem solving session', 1, TRUE, '2024-02-01', '2024-05-30', '2,4'), -- Tue, Thu
(11, 'Physics Problem Solving', '17:30:00', '19:30:00', 'Jefferson Lab Room 256', 'Weekly session to work through physics problem sets', 3, TRUE, '2024-02-02', '2024-05-31', '3'), -- Wed
(12, 'Economics Discussion Group', '15:00:00', '17:00:00', 'Littauer Center Room 301', 'Weekly economics topic discussion and problem solving', 2, TRUE, '2024-02-03', '2024-05-29', '1,3'), -- Mon, Wed

-- MIT recurring meetings (study groups 13-15)
(13, 'Algorithm Design Workshop', '16:30:00', '18:30:00', 'Stata Center 32-123', 'Weekly algorithm design and analysis session', 5, TRUE, '2024-02-05', '2024-05-28', '2,5'), -- Tue, Fri
(14, 'Theory of Computation Study', '15:00:00', '17:00:00', 'Building 2 Room 105', 'Weekly computational theory problem solving', 18, TRUE, '2024-02-06', '2024-05-29', '3'), -- Wed
(15, 'Biology Research Discussion', '17:00:00', '19:00:00', 'Building 68 Room 181', 'Weekly biology research and lab discussion', 20, TRUE, '2024-02-07', '2024-05-30', '4'); -- Thu

-- Add more Tags
-- Starting after the 5 existing tags in the original script
INSERT INTO Tags (tag_id, name, description) VALUES
(6, 'Beginner Friendly', 'Suitable for students new to the subject'),
(7, 'Advanced Topics', 'Explores complex and advanced subject matter'),
(8, 'Exam Preparation', 'Focused on preparing for upcoming exams'),
(9, 'Research Focused', 'Emphasis on research methodologies and findings'),
(10, 'Discussion Based', 'Primarily discussion-oriented rather than lecture format'),
(11, 'Problem Solving', 'Dedicated to solving practice problems and exercises'),
(12, 'Lab Preparation', 'Preparation for laboratory components of courses');

-- Tag the study groups
INSERT INTO StudyGroup_Tags (study_group_id, tag_id) VALUES
-- Boston University study groups tags (study groups 1-3)
(1, 7), (1, 6), -- CS330 Algorithm Masters: Advanced Topics, Problem Solving
(2, 8), (2, 9), -- BIO315 Research Squad: Research Focused, Lab Preparation
(3, 8), (3, 10), -- Business Analytics Group: Project Collaboration, Discussion Based

-- Northeastern University study groups tags (study groups 4-6)
(4, 8), (4, 12), -- Circuit Breakers: Problem Solving, Lab Preparation
(5, 8), (5, 7), -- Database Design Crew: Project Collaboration, Advanced Topics
(6, 6), (6, 8), -- Data Science Explorers: Beginner Friendly, Project Collaboration

-- Boston College study groups tags (study groups 7-9)
(7, 6), (7, 8), -- Econ Theory Team: Problem Solving, Exam Preparation
(8, 10), (8, 6), -- Modern History Discussion: Discussion Based, Beginner Friendly
(9, 8), (9, 12), -- BC Biology Lab Partners: Exam Preparation, Lab Preparation

-- Harvard study groups tags (study groups 10-12)
(10, 7), (10, 6), -- Harvard Algorithm Squad: Advanced Topics, Problem Solving
(11, 7), (11, 8), -- Quantum Physics Group: Advanced Topics, Exam Preparation
(12, 10), (12, 6), -- Harvard Economics Forum: Discussion Based, Beginner Friendly

-- MIT study groups tags (study groups 13-15)
(13, 7), (13, 6), -- MIT Algorithm Masters: Advanced Topics, Problem Solving
(14, 7), (14, 6), -- Computation Theory Group: Advanced Topics, Problem Solving
(15, 9), (15, 12); -- Biology Research Collective: Research Focused, Lab Preparation

-- Add more Achievements
-- Starting after the 3 existing achievements in the original script
INSERT INTO Achievements (achievement_id, name, description, is_platform_default) VALUES
(4, 'Group Leader', 'Created and managed a successful study group with high member engagement', TRUE),
(5, 'Networking Pro', 'Joined and actively participated in 5+ different study groups', TRUE),
(6, 'Digital Collaborator', 'Effectively utilized digital tools for remote collaboration', TRUE),
(7, 'Perfect Attendance', 'Attended all scheduled meetings for a full semester', TRUE),
(8, 'Helpful Peer', 'Received recognition from group members for exceptional contributions', TRUE),
(9, 'Cross-Disciplinary Scholar', 'Successfully participated in study groups across multiple disciplines', TRUE),
(10, 'Community Builder', 'Helped integrate new members into study groups', TRUE);

-- Award Achievements to Users
INSERT INTO UserAchievements (user_id, achievement_id) VALUES
-- Boston University student achievements (users 6-9)
(6, 4), (6, 6),  -- Jordan: Group Leader, Digital Collaborator
(7, 4), (7, 8),  -- Taylor: Group Leader, Helpful Peer
(8, 4), (8, 9),  -- Alex: Group Leader, Cross-Disciplinary Scholar
(9, 4), (9, 7),  -- Morgan: Group Leader, Perfect Attendance

-- Northeastern University student achievements (users 10-13)
(10, 4), (10, 6),  -- Casey: Group Leader, Digital Collaborator
(11, 4), (11, 8),  -- Jamie: Group Leader, Helpful Peer
(12, 4), (12, 10), -- Riley: Group Leader, Community Builder
(13, 4), (13, 5),  -- Avery: Group Leader, Networking Pro

-- Boston College student achievements (users 14-17)
(14, 4), (14, 9),  -- Quinn: Group Leader, Cross-Disciplinary Scholar
(15, 4), (15, 6),  -- Sasha: Group Leader, Digital Collaborator
(16, 4), (16, 7),  -- Devon: Group Leader, Perfect Attendance
(17, 4), (17, 8),  -- Jordan: Group Leader, Helpful Peer

-- Harvard student achievements (users 1-4)
(1, 4), (1, 6),  -- Mike: Group Leader, Digital Collaborator
(2, 4), (2, 10), -- Sarah: Group Leader, Community Builder
(3, 4), (3, 7),  -- James: Group Leader, Perfect Attendance
(4, 4), (4, 5),  -- Emma: Group Leader, Networking Pro

-- MIT student achievements (users 5, 18-20)
(5, 4), (5, 9),   -- David: Group Leader, Cross-Disciplinary Scholar
(18, 4), (18, 8), -- Ethan: Group Leader, Helpful Peer
(19, 4), (19, 6), -- Olivia: Group Leader, Digital Collaborator
(20, 4), (20, 7); -- Zoe: Group Leader, Perfect Attendance

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

DELIMITER //

CREATE PROCEDURE sp_GetUserMetrics(IN in_user_id INT)
BEGIN
  SELECT
    (SELECT COUNT(*) FROM StudyGroup
        WHERE owner_id = in_user_id)                  AS created_groups,
    (SELECT COUNT(*) FROM User_StudyGroup
        WHERE user_id = in_user_id)                  AS joined_groups,
    (SELECT COUNT(*) FROM UserAchievements
        WHERE user_id = in_user_id)                  AS achievements,
    (SELECT COUNT(*) FROM User_Course
        WHERE user_id = in_user_id)                  AS courses;
END
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER tr_AfterStudyGroupInsert
AFTER INSERT ON StudyGroup
FOR EACH ROW
BEGIN
    -- If a course is specified, ensure the owner is enrolled in it
    IF NEW.course_code IS NOT NULL AND NEW.university_id IS NOT NULL THEN
        -- Check if user is already enrolled
        IF NOT EXISTS (SELECT 1 FROM User_Course 
                      WHERE user_id = NEW.owner_id 
                      AND course_code = NEW.course_code 
                      AND university_id = NEW.university_id) THEN
            -- Add the user to the course
            INSERT INTO User_Course (user_id, course_code, university_id)
            VALUES (NEW.owner_id, NEW.course_code, NEW.university_id);
        END IF;
    END IF;
END//

DELIMITER ;

