const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const universityRoutes = require('./routes/universityRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studyGroupRoutes = require('./routes/studyGroupRoutes');
const tagRoutes = require('./routes/tagRoutes'); 



require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;


// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/tags', tagRoutes);


// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StudySync API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});