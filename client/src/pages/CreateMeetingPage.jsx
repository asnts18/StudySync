// pages/CreateMeetingPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import studyGroupService from '../api/studyGroupService';
import meetingService from '../api/meetingService';

const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' }
];

const CreateMeetingPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // State for form fields
  const [meetingName, setMeetingName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  // UI state
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch group details on component mount
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const groupData = await studyGroupService.getGroupById(groupId);
        setGroupDetails(groupData);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  // Handle day selection toggle
  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Form validation
  const validateForm = () => {
    // Reset errors
    setError('');
    
    // Required fields check
    if (!meetingName) {
      setError('Meeting name is required');
      return false;
    }
    
    if (!startTime) {
      setError('Start time is required');
      return false;
    }
    
    if (!endTime) {
      setError('End time is required');
      return false;
    }
    
    // Time validation - ensure end time is after start time
    if (startTime && endTime && startTime >= endTime) {
      setError('End time must be after start time');
      return false;
    }
    
    // Validate based on meeting type (recurring or one-time)
    if (isRecurring) {
      if (!startDate) {
        setError('Start date is required for recurring meetings');
        return false;
      }
      
      if (!endDate) {
        setError('End date is required for recurring meetings');
        return false;
      }
      
      if (startDate && endDate && startDate > endDate) {
        setError('End date must be after start date');
        return false;
      }
      
      if (selectedDays.length === 0) {
        setError('Please select at least one day for the recurring meeting');
        return false;
      }
    } else {
      if (!meetingDate) {
        setError('Meeting date is required for one-time meetings');
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Prepare meeting data
    const meetingData = {
      study_group_id: groupId,
      name: meetingName,
      start_time: startTime,
      end_time: endTime,
      location: location || null,
      description: description || null,
      // created_by will be set by the server using the authenticated user
      is_recurring: isRecurring,
      meeting_date: isRecurring ? null : meetingDate,
      start_date: isRecurring ? startDate : null,
      end_date: isRecurring ? endDate : null,
      recurrence_days: isRecurring ? selectedDays.sort().join(',') : null
    };
    
    try {
        setSubmitting(true);
        setError('');
        
        // Call API to create meeting
        const response = await meetingService.createMeeting(meetingData);
        
        setSuccess('Meeting created successfully!');
        
        // Redirect back to group page after a short delay
        setTimeout(() => {
          navigate(`/groups/${groupId}`);
        }, 1500);
        
      } catch (err) {
        console.error('Error creating meeting:', err);
        setError('Failed to create meeting. Please try again.');
      } finally {
        setSubmitting(false);
      }
  };

  // Format time for display (if needed)
  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate(`/groups/${groupId}`)} 
            className="p-2 border-2 border-black hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">create meeting</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading group details...</div>
        ) : (
          <>
            {/* Group context info */}
            {groupDetails && (
              <div className="mb-8 p-4 border-2 border-black bg-gray-50">
                <p className="text-lg">
                  Creating a meeting for: <span className="font-semibold">{groupDetails.name}</span>
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 border-2 border-green-500 bg-green-100 text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Meeting name */}
              <div className="space-y-4 w-full">
                <label className="block text-lg">Meeting Name</label>
                <input
                  type="text"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="Weekly Study Session"
                  required
                  className="w-full p-4 border-2 border-black focus:outline-none"
                />
              </div>

              {/* Meeting time will be moved inside the conditional sections */}

              {/* Location */}
              <div className="space-y-4 w-full">
                <label className="block text-lg">Location (optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Library, Room 101, or Online via Zoom"
                  className="w-full p-4 border-2 border-black focus:outline-none"
                />
              </div>

              {/* Meeting type selection */}
              <div className="space-y-4">
                <label className="block text-lg">Meeting Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(false)}
                    className={`px-6 py-2 border-2 border-black rounded-full transition-colors ${
                      !isRecurring ? "bg-primary-yellow" : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    One-time Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(true)}
                    className={`px-6 py-2 border-2 border-black rounded-full transition-colors ${
                      isRecurring ? "bg-primary-yellow" : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    Recurring Meeting
                  </button>
                </div>
              </div>

              {/* Conditional fields based on meeting type */}
              {isRecurring ? (
                <div className="space-y-8 border-2 border-black p-6">
                  <h3 className="text-xl font-medium">Recurring Meeting Details</h3>

                  {/* Meeting time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-lg">Start Time</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          className="w-full pl-10 p-4 border-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-lg">End Time</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                          className="w-full pl-10 p-4 border-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Date range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-lg">Start Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required={isRecurring}
                          className="w-full pl-10 p-4 border-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-lg">End Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required={isRecurring}
                          className="w-full pl-10 p-4 border-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recurring days selection */}
                  <div className="space-y-4">
                    <label className="block text-lg">Repeat On</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`px-4 py-2 border-2 border-black rounded-full transition-colors ${
                            selectedDays.includes(day.value)
                              ? "bg-primary-yellow"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedDays.length ? 
                        `Selected: ${selectedDays.map(d => DAYS_OF_WEEK.find(day => day.value === d).label).join(', ')}` : 
                        'Please select at least one day'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 border-2 border-black p-6">
                  <h3 className="text-xl font-medium">One-time Meeting Details</h3>
                  
                  {/* Meeting time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-lg">Start Time</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          className="w-full pl-10 p-4 border-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-lg">End Time</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                          className="w-full pl-10 p-4 border-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-lg">Meeting Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        required={!isRecurring}
                        className="w-full pl-10 p-4 border-2 border-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-4 w-full">
                <label className="block text-lg">Description (optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional details about this meeting..."
                  className="p-4 min-h-32 w-full"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-12 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl disabled:opacity-70"
                >
                  {submitting ? "Creating..." : "Create Meeting"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(`/groups/${groupId}`)}
                  className="px-8 py-4 border-2 border-black hover:bg-gray-100 transition-colors text-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default CreateMeetingPage;