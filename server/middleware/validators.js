// middleware/validators.js
const { body, param, validationResult } = require('express-validator');

// Utility function to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User profile validation
const userProfileValidationRules = [
  body('email')
    .isEmail().withMessage('Must provide a valid email address')
    .normalizeEmail(),
  body('first_name')
    .trim()
    .isLength({ min: 1 }).withMessage('First name is required'),
  body('last_name')
    .trim()
    .isLength({ min: 1 }).withMessage('Last name is required'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('university_id')
    .optional()
    .isInt().withMessage('University ID must be an integer')
];

// User registration validation
const userRegistrationRules = [
  ...userProfileValidationRules,
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
];

// Login validation
const loginValidationRules = [
  body('email')
    .isEmail().withMessage('Must provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 1 }).withMessage('Password is required')
];

// Course validation
const courseValidationRules = [
  body('courseId')
    .isString().withMessage('Course ID must be a string')
];

// Study group validation
const studyGroupValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Study group name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('course_code')
    .isString().withMessage('Course code is required'),
  body('university_id')
    .isInt().withMessage('University ID must be an integer'),
  body('max_capacity')
    .optional()
    .isInt({ min: 1, max: 8 }).withMessage('Max capacity must be between 1 and 8'),
  body('is_private')
    .optional()
    .isBoolean().withMessage('is_private must be a boolean')
];

// Meeting validation
const meetingValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Meeting name must be between 3 and 100 characters'),
  body('start_time')
    .isTime().withMessage('Valid start time is required (HH:MM format)'),
  body('end_time')
    .isTime().withMessage('Valid end time is required (HH:MM format)')
    .custom((value, { req }) => {
      // Custom validation to ensure end_time is after start_time
      if (value <= req.body.start_time) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Location must be less than 255 characters'),
  body('is_recurring')
    .isBoolean().withMessage('is_recurring must be a boolean value'),
  // Conditional validation based on is_recurring
  body('meeting_date')
    .custom((value, { req }) => {
      if (req.body.is_recurring === false && !value) {
        throw new Error('Meeting date is required for non-recurring meetings');
      }
      if (value) {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          throw new Error('Meeting date must be in YYYY-MM-DD format');
        }
      }
      return true;
    }),
  body('start_date')
    .custom((value, { req }) => {
      if (req.body.is_recurring === true && !value) {
        throw new Error('Start date is required for recurring meetings');
      }
      if (value) {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          throw new Error('Start date must be in YYYY-MM-DD format');
        }
      }
      return true;
    }),
  body('end_date')
    .custom((value, { req }) => {
      if (req.body.is_recurring === true) {
        if (!value) {
          throw new Error('End date is required for recurring meetings');
        }
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          throw new Error('End date must be in YYYY-MM-DD format');
        }
        // Ensure end_date is after start_date
        if (value < req.body.start_date) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  body('recurrence_days')
    .custom((value, { req }) => {
      if (req.body.is_recurring === true && !value) {
        throw new Error('Recurrence days are required for recurring meetings');
      }
      if (value) {
        // Validate format (comma-separated numbers 0-6, representing days of the week)
        const daysArray = value.split(',').map(day => day.trim());
        const validDays = daysArray.every(day => /^[0-6]$/.test(day));
        if (!validDays) {
          throw new Error('Recurrence days must be comma-separated values from 0-6 (Sunday-Saturday)');
        }
      }
      return true;
    })
];

// ID parameter validation
const validateId = [
  param('id').isInt().withMessage('ID must be an integer')
];

// Combine validation rules with the result checker for easy use in routes
const userProfileValidation = [...userProfileValidationRules, validateRequest];
const userRegistrationValidation = [...userRegistrationRules, validateRequest];
const loginValidation = [...loginValidationRules, validateRequest];
const courseValidation = [...courseValidationRules, validateRequest];
const studyGroupValidation = [...studyGroupValidationRules, validateRequest];
const meetingValidation = [...meetingValidationRules, validateRequest];
const idValidation = [...validateId, validateRequest];

module.exports = {
  userProfileValidation,
  userRegistrationValidation,
  loginValidation,
  courseValidation,
  studyGroupValidation,
  meetingValidation,
  idValidation,
  validateRequest
};