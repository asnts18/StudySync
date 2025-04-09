// Form validation utilities matching backend requirements (validators.js)

// Email validation
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!regex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  
  // Password validation (matches userRegistrationRules in validators.js)
  export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    return '';
  };
  
  // Confirm password validation
  export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };
  
  // Name validation (first_name, last_name)
  export const validateName = (name, fieldName = 'Name') => {
    if (!name || name.trim() === '') return `${fieldName} is required`;
    return '';
  };
  
  // Bio validation (matches userProfileValidationRules in validators.js)
  export const validateBio = (bio) => {
    if (bio && bio.length > 500) return 'Bio must be less than 500 characters';
    return '';
  };
  
  // University ID validation
  export const validateUniversityId = (universityId) => {
    if (!universityId) return 'Please select a university';
    return '';
  };
  
  // Study group validation (matches studyGroupValidationRules in validators.js)
  export const validateGroupName = (name) => {
    if (!name || name.trim() === '') return 'Group name is required';
    if (name.length < 3) return 'Group name must be at least 3 characters';
    if (name.length > 100) return 'Group name must be less than 100 characters';
    return '';
  };
  
  export const validateGroupDescription = (description) => {
    if (description && description.length > 500) return 'Description must be less than 500 characters';
    return '';
  };
  
  export const validateMaxCapacity = (maxCapacity) => {
    const capacity = parseInt(maxCapacity);
    if (isNaN(capacity)) return 'Maximum capacity must be a number';
    if (capacity < 1 || capacity > 8) return 'Maximum capacity must be between 1 and 8';
    return '';
  };
  
  // Form validation helper
  export const validateForm = (formData, validationRules) => {
    const errors = {};
    let isValid = true;
  
    for (const field in validationRules) {
      const error = validationRules[field](formData[field], formData);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  
    return { isValid, errors };
  };
  
  // Predefined validation rule sets
  export const registerFormRules = {
    email: validateEmail,
    password: validatePassword,
    confirmPassword: (value, formData) => validateConfirmPassword(formData.password, value),
    first_name: (value) => validateName(value, 'First name'),
    last_name: (value) => validateName(value, 'Last name'),
    bio: validateBio,
    university_id: validateUniversityId
  };
  
  export const loginFormRules = {
    email: validateEmail,
    password: (value) => value ? '' : 'Password is required'
  };
  
  export const studyGroupFormRules = {
    name: validateGroupName,
    description: validateGroupDescription,
    max_capacity: validateMaxCapacity,
    course_code: (value) => value ? '' : 'Course code is required',
    university_id: validateUniversityId
  };