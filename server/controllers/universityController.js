// server/controllers/universityController.js
const universityService = require('../services/universityService');

const getAllUniversities = async (req, res) => {
  try {
    const universities = await universityService.getAllUniversities();
    res.status(200).json(universities);
  } catch (error) {
    console.error('Error in getAllUniversities controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUniversityById = async (req, res) => {
  try {
    const universityId = req.params.id;
    const university = await universityService.getUniversityById(universityId);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    res.status(200).json(university);
  } catch (error) {
    console.error('Error in getUniversityById controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUniversities,
  getUniversityById
};