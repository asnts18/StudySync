// components/PendingRequestsNotification.jsx
import React, { useState, useEffect } from 'react';
import { BellRing, Clock, X, User } from 'lucide-react';
import studyGroupService from '../api/studyGroupService';

const PendingRequestsNotification = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Fetch pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        const data = await studyGroupService.getPendingJoinRequests();
        console.log('Fetched pending requests:', data); // Debug log
        setPendingRequests(data);
        setError('');
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        // Don't show the error message in the UI to avoid confusion
        // Just set an empty array for pending requests
        setPendingRequests([]);
        setError('');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingRequests();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchPendingRequests, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  
  return (
    <div className="relative notification-dropdown">
      {/* Bell icon with counter */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full"
        aria-label={`${pendingRequests.length} pending requests`}
      >
        <BellRing className="w-5 h-5" />
        {pendingRequests.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {pendingRequests.length}
          </span>
        )}
      </button>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-black shadow-lg z-10">
          <div className="p-3 border-b border-gray-200 font-medium flex justify-between items-center">
            <span>Pending Group Requests</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close notification panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading your requests...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No pending requests.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {pendingRequests.map((request) => (
                <div key={request.request_id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium">
                        Request to join <span className="font-semibold">{request.group_name}</span>
                      </p>
                      {request.course_code && (
                        <p className="text-xs text-gray-500">
                          {request.course_code}: {request.course_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Requested {formatRelativeTime(request.request_date)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingRequestsNotification;