// test-user-model.js
const User = require('./user.model');

// Function to test user model methods
async function testUserModel() {
  try {
    console.log('Testing User Model...');
    
    // Test create user
    const testUser = {
      email: `test${Math.floor(Math.random() * 1000)}@example.com`, // Make email unique
      password: 'hashedpassword123', // In a real app, this would be hashed
      first_name: 'Test',
      last_name: 'User',
      bio: 'This is a test user',
      university_id: 1
    };
    
    console.log('Creating test user:', testUser);
    const createdUser = await User.create(testUser);
    console.log('User created successfully:', createdUser);
    
    // Test find by ID
    console.log(`Finding user by ID: ${createdUser.user_id}`);
    const foundById = await User.findById(createdUser.user_id);
    console.log('User found by ID:', foundById);
    
    // Test find by email
    console.log(`Finding user by email: ${testUser.email}`);
    const foundByEmail = await User.findByEmail(testUser.email);
    console.log('User found by email:', foundByEmail);
    
    // Test update user
    const updateData = {
      email: testUser.email,
      first_name: 'Updated',
      last_name: 'Name',
      bio: 'Updated bio',
      university_id: 1
    };
    console.log(`Updating user ${createdUser.user_id} with:`, updateData);
    const updated = await User.update(createdUser.user_id, updateData);
    console.log('Update result:', updated);
    
    // Verify update worked
    const updatedUser = await User.findById(createdUser.user_id);
    console.log('Updated user:', updatedUser);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testUserModel();