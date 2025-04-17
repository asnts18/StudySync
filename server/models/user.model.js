// server/models/user.model.js
const DatabaseService = require('../services/dbService');

class UserModel extends DatabaseService {
  constructor() {
    super('User', 'user_id'); // Table name and primary key
  }

  // Custom methods specific to User
  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async createUser(userData) {
    // You could add validation or transformations here
    return await this.create({
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      bio: userData.bio || null,
      university_id: userData.university_id || null
    });
  }

  async getUserProfile(userId) {
    try {
      // Example of calling a stored procedure
      return await this.callStoredProcedure('sp_GetUserProfile', [userId]);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, userData) {
    // You could add validation or transformations here
    return await this.update(userId, {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      bio: userData.bio,
      university_id: userData.university_id
    });
  }
}

// Export a singleton instance
module.exports = new UserModel();