// components/PendingRequestsNotification.jsx
import React, { useState, useEffect } from 'react';
import { BellRing, Clock, X, User, Check, AlertCircle } from 'lucide-react';
import notificationService from '../api/notificationService';
import studyGroupService from '../api/studyGroupService';

const PendingRequestsNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [processingActions, setProcessingActions] = useState({});
  
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
  
  // Fetch notifications and pending requests
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications
      const notificationsData = await notificationService.getNotifications();
      console.log('Fetched notifications:', notificationsData);
      setNotifications(notificationsData || []);
      
      // Fetch pending join requests
      try {
        const requestsData = await studyGroupService.getPendingJoinRequests();
        console.log('Fetched pending requests:', requestsData);
        setPendingRequests(requestsData || []);
      } catch (reqError) {
        console.error('Error fetching pending requests:', reqError);
        setPendingRequests([]);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Run initial fetch
  useEffect(() => {
    fetchData();
    
    // Refresh every 60 seconds
    const intervalId = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle request response (approve or reject)
  const handleDirectAction = async (notification, action) => {
    try {
      const notificationId = notification.notification_id;
      setProcessingActions(prev => ({ ...prev, [notificationId]: true }));
      
      console.log(`Processing ${action} for notification:`, notification);
      
      // Extract group name from notification
      const groupNameRegex = /New join request for your study group: (.+)/i;
      const match = notification.message.match(groupNameRegex);
      const groupName = match ? match[1] : null;
      
      if (!groupName) {
        alert("Could not extract group name from notification message");
        return;
      }
      
      console.log('Looking for matching request with group name:', groupName);
      console.log('Available pending requests:', pendingRequests);
      
      // Find all pending requests and log them to see their structure
      const pendingRequestsForGroup = pendingRequests.filter(req => {
        const groupMatches = (req.group_name === groupName || req.name === groupName);
        console.log(`Request for: ${req.group_name || req.name}, matches: ${groupMatches}`);
        return groupMatches;
      });
      
      console.log('Filtered requests for this group:', pendingRequestsForGroup);
      
      // If we found matching requests, use the first one
      if (pendingRequestsForGroup.length > 0) {
        const matchingRequest = pendingRequestsForGroup[0];
        
        console.log('Using matched request:', matchingRequest);
        
        // Process the request using respondToJoinRequest
        // This will use the existing database trigger
        await studyGroupService.respondToJoinRequest(
          matchingRequest.study_group_id, 
          matchingRequest.request_id, 
          action
        );
        
        console.log(`Successfully ${action}ed request`);
        
        // Delete the notification
        await notificationService.deleteNotification(notificationId);
        
        // Refresh data
        await fetchData();
      } else {
        // If no matching request found by direct comparison, try the API method
        console.log('No direct match found, trying processByGroupName API...');
        
        try {
          // This method handles finding the correct request by group name
          const result = await studyGroupService.processByGroupName(
            groupName,
            action
          );
          
          console.log('processByGroupName result:', result);
          
          if (result.success) {
            // Delete the notification
            await notificationService.deleteNotification(notificationId);
            
            // Refresh data
            await fetchData();
          } else {
            throw new Error(result.message || 'Failed to process request');
          }
        } catch (apiError) {
          console.error('Error with processByGroupName:', apiError);
          alert(`Unable to find a pending request for group "${groupName}". The request may have already been processed.`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Error processing the request. Please try again later.`);
    } finally {
      setProcessingActions(prev => ({ ...prev, [notification.notification_id]: false }));
    }
  };
  
  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

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
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => 
    n.status === 'unread' || n.status === 'pending'
  ).length;
  
  // Check if a notification is a join request
  const isJoinRequest = (notification) => {
    return notification.message.includes('New join request for your study group');
  };
  
  return (
    <div className="relative notification-dropdown">
      {/* Bell icon with counter */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full"
        aria-label={`${unreadCount} notifications`}
      >
        <BellRing className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-black shadow-lg z-10">
          <div className="p-3 border-b border-gray-200 font-medium flex justify-between items-center">
            <span>Notifications</span>
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
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.notification_id} 
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                    notification.status === 'unread' || notification.status === 'pending' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatRelativeTime(notification.created_at)}
                      </p>
                      
                      {/* Action buttons for join requests */}
                      {isJoinRequest(notification) && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleDirectAction(notification, 'approve')}
                            disabled={processingActions[notification.notification_id]}
                            className="px-3 py-2 bg-primary-yellow border-2 border-black text-sm font-medium hover:bg-dark-yellow transition-colors rounded flex items-center disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDirectAction(notification, 'reject')}
                            disabled={processingActions[notification.notification_id]}
                            className="px-3 py-2 bg-gray-100 border-2 border-black text-sm font-medium hover:bg-gray-200 transition-colors rounded flex items-center disabled:opacity-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <button 
                        onClick={() => deleteNotification(notification.notification_id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        aria-label="Delete notification"
                      >
                        <X className="w-3 h-3" />
                      </button>
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