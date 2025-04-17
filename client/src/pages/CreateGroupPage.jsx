// pages/CreateGroupPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, X } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import courseService from "../api/courseService";
import studyGroupService from "../api/studyGroupService";
import tagService from "../api/tagService";
import { useAuth } from "../contexts/AuthContext";

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [groupSize, setGroupSize] = useState("3");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  // Course-related state
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const [isAddingNewCourse, setIsAddingNewCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch courses and tags when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Fetch courses if user is logged in and has a university
        if (currentUser && currentUser.university_id) {
          const universityCourses = await courseService.getCoursesByUniversity(currentUser.university_id);
          setCourses(universityCourses);
        }
        
        // Fetch available tags
        const tags = await tagService.getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load necessary data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleAddNewCourse = () => {
    setIsAddingNewCourse(true);
    setSelectedCourse("");
    setSelectedCourseObj(null);
  };

  const handleCancelNewCourse = () => {
    setIsAddingNewCourse(false);
    setNewCourseName("");
    setNewCourseCode("");
  };

  const handleClearSelectedCourse = () => {
    setSelectedCourse("");
    setSelectedCourseObj(null);
  };

  // Toggle tag selection
  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // Create a new course and enroll the user in it
  const handleCreateNewCourse = async () => {
    if (!newCourseCode || !newCourseName) {
      alert("Course code and name are required");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // Create course data object
      const newCourse = {
        course_code: newCourseCode.trim(), // Ensure no extra whitespace
        name: newCourseName,
        university_id: currentUser.university_id,
        semester: "Current", // Default value
        description: `Added by ${currentUser.first_name} ${currentUser.last_name}`,
        course_type: "Custom"
      };
      
      console.log("Creating course with data:", newCourse);
      // Call API to create the course
      const response = await courseService.createCourse(newCourse);
      console.log("Created course:", response);
      
      // Get the created course object
      const createdCourse = response.course || response;
      
      // Add to local state
      setCourses(prevCourses => [...prevCourses, createdCourse]);
      
      // Save as selected course
      setSelectedCourse(createdCourse.course_code);
      setSelectedCourseObj(createdCourse);
      
      setIsAddingNewCourse(false);
      setNewCourseName("");
      setNewCourseCode("");
    } catch (error) {
      console.error("Error creating course:", error);
      setError("Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = searchQuery 
    ? courses.filter(course => 
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  const handleSelectCourse = (course) => {
    setSelectedCourse(course.course_code);
    setSelectedCourseObj(course);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Name validation
    if (!groupName) {
      alert("Please provide a group name");
      return;
    }

    // Max capacity validation
    const maxCapacity = parseInt(groupSize);
    if (isNaN(maxCapacity) || maxCapacity < 1 || maxCapacity > 8) {
      alert("Group size must be between 1 and 8 members");
      return;
    }
    
    // Create study group data object
    const studyGroupData = {
      name: groupName,
      description: additionalInfo || "Study group for course collaboration",
      course_code: selectedCourse || null,
      university_id: currentUser.university_id,
      max_capacity: parseInt(groupSize),
      is_private: isPrivate,
      tags: selectedTags // Include the selected tags
    };
    
    console.log("Creating study group:", studyGroupData);
    
    try {
      setIsLoading(true);
      setError("");
      
      // Call the API to create the study group
      const createdGroup = await studyGroupService.createGroup(studyGroupData);
      console.log("Created group:", createdGroup);
      
      // Navigate to "My Groups" page with a success message about the new group
      navigate('/home', { state: { newGroupCreated: true, groupName: groupName } });
    } catch (error) {
      console.error("Error creating study group:", error);
      setError("Failed to create study group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate('/home')} 
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">create a study group</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col items-start">
          {/* Name Section */}
          <div className="space-y-4 w-full">
            <label className="block text-lg text-left">Give your study group a name!</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="For fun study group"
              className="w-full p-4 border-2 border-black focus:outline-none"
            />
          </div>

          {/* Course Selection Section */}
          <div className="space-y-4 w-full">
            <label className="block text-lg text-left">Select a course (optional)</label>
            
            {isAddingNewCourse ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      placeholder="Course Code (e.g. CS101)"
                      className="w-full p-4 border-2 border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="Course Name (e.g. Intro to Computer Science)"
                      className="w-full p-4 border-2 border-black focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCreateNewCourse}
                    disabled={isLoading}
                    className="px-4 py-2 border-2 border-black bg-primary-yellow hover:bg-dark-yellow transition-colors"
                  >
                    {isLoading ? "Creating..." : "Create Course"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelNewCourse}
                    className="px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for a course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-10 border-2 border-black focus:outline-none"
                  />
                </div>
                
                {isLoading ? (
                  <p>Loading courses...</p>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto border-2 border-black">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                          <div
                            key={`${course.course_code}-${course.university_id}`}
                            onClick={() => handleSelectCourse(course)}
                            className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                              selectedCourse === course.course_code ? "bg-light-orange" : ""
                            }`}
                          >
                            <p className="font-medium">{course.course_code}</p>
                            <p className="text-sm text-gray-600">{course.name}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500">
                          {searchQuery ? "No courses match your search" : "No courses available"}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddNewCourse}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add a new course
                      </button>
                      
                      {selectedCourse && (
                        <div className="ml-4 px-3 py-1 bg-light-orange border-2 border-black flex items-center gap-2">
                          <span>Selected: {selectedCourse}</span>
                          <button 
                            type="button" 
                            onClick={handleClearSelectedCourse}
                            className="p-1 hover:bg-orange-200 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tag Selection Section */}
          <div className="space-y-4 w-full">
            <label className="block text-lg text-left">Study Style Tags</label>
            <p className="text-sm text-gray-500 mb-2">
              Select tags that describe your study group style to help others find your group
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.tag_id}
                  type="button"
                  onClick={() => handleTagToggle(tag.tag_id)}
                  className={`px-6 py-2 border-2  rounded-full  transition-colors ${
                    selectedTags.includes(tag.tag_id)
                      ? "border-black bg-primary-yellow"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {availableTags.length === 0 && !isLoading && (
              <p className="text-gray-500">No tags available</p>
            )}
          </div>

          {/* Group Size Section */}
          <div className="space-y-4 flex flex-col items-start">
            <label className="block text-lg text-left">How many people are you looking for total?</label>
            <select
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-48 p-4 border-2 border-black focus:outline-none appearance-none bg-white"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} people
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Setting Section */}
          <div className="space-y-4 flex flex-col items-start">
            <label className="block text-lg text-left">Group privacy</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`px-6 py-2 border-2 border-black rounded-full transition-colors ${
                  !isPrivate ? "bg-primary-yellow" : "bg-white hover:bg-gray-100"
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`px-6 py-2 border-2 border-black rounded-full transition-colors ${
                  isPrivate ? "bg-primary-yellow" : "bg-white hover:bg-gray-100"
                }`}
              >
                Private
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {isPrivate 
                ? "Private: People need to request to join your group" 
                : "Public: Anyone can join your group without approval"}
            </p>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4 w-full">
            <label className="block text-lg text-left">Anything else to add?</label>
            <Textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder={`Feel free to introduce yourself briefly, share your preferred group learning methods, what you want to get from the group study, your hobbies, personalities, etc.

Tip:
The more you share, the easier to find the ideal group.`}
              className="min-h-[200px] p-4 border-2 border-black focus:outline-none resize-none w-full"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="px-12 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl disabled:opacity-70"
          >
            {isLoading ? "Creating..." : "create group"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateGroupPage;