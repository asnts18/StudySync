// components/GroupEditModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Textarea } from './ui/textarea';
import studyGroupService from '../api/studyGroupService';

const GroupEditModal = ({ group, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current group data into form
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || ''
      });
    }
  }, [group]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call API to update group
      await studyGroupService.updateGroup(group.study_group_id, {
        name: formData.name,
        description: formData.description
      });
      
      // Notify parent component of success
      onUpdateSuccess({
        ...group,
        name: formData.name,
        description: formData.description
      });
      
      // Close modal
      onClose();
    } catch (err) {
      console.error('Error updating group:', err);
      setError('Failed to update group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="border-b-2 border-black p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">Edit Group</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 border-2 border-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-3 border-2 border-red-500 bg-red-100 text-red-700">
              {error}
            </div>
          )}
          
          {/* Name field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-lg font-medium">Group Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border-2 border-black focus:outline-none"
              required
            />
          </div>
          
          {/* Description field */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-lg font-medium">Description</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 min-h-[120px]"
              placeholder="Describe your study group..."
            />
            <p className="text-sm text-gray-500">
              {formData.description ? formData.description.length : 0}/500 characters
            </p>
          </div>
          
          {/* Other fields as disabled/read-only */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">Course (Cannot be modified)</label>
            <div className="p-3 bg-gray-100 border-2 border-gray-300">
              {group.course_code 
                ? `${group.course_code}${group.course_name ? `: ${group.course_name}` : ''}` 
                : 'No specific course'}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-lg font-medium">Privacy Setting (Cannot be modified)</label>
            <div className="p-3 bg-gray-100 border-2 border-gray-300">
              {group.is_private ? 'Private Group' : 'Public Group'}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-lg font-medium">Max Capacity (Cannot be modified)</label>
            <div className="p-3 bg-gray-100 border-2 border-gray-300">
              {group.max_capacity || group.maxMembers} members
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupEditModal;