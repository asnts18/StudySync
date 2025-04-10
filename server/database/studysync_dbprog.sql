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
