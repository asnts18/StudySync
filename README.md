# StudySync

Team members: Abegail Santos and Navaneeth Maruthi

## 📚 About the Application
StudySync is a web-based platform designed to help college students—especially those with social anxiety, shyness, or who are new to campus—find study partners and accountability groups in their classes. Our goal is to create a seamless and stress-free way to connect students based on learning styles, study habits, and academic goals.

## 💻 Tech Stack

### Frontend:
- React.js (v18.2.0)
- React Router (v6.15.0)
- Tailwind CSS (v3.3.3)
- Lucide React (v0.263.1)

### Backend:
- Node.js (v18.x)
- Express.js (v4.18.2)
- MySQL (v8.0)
- JWT for authentication
- Bcrypt.js for password hashing

## 🛠 How to Run the Application

### Prerequisites
- Node.js (v18.x or later)
- MySQL (v8.0 or later)
- npm (v9.x or later)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/studysync.git
   cd studysync
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Set up the database:
   ```bash
   # Log into MySQL
   mysql -u root -p

   # Create database and tables
   mysql> source ./database/studysync_schema.sql

   # Import sample data
   mysql> source ./database/studysync_dbprog.sql
   ```

4. Configure environment variables:
   Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5001
   DB_HOST=localhost
   DB_USER=yourusername
   DB_PASSWORD=yourpassword
   DB_NAME=studysync
   JWT_SECRET=your_jwt_secret_key
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on http://localhost:5001

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint:
   Create a `.env` file in the client directory with:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will open in your browser at http://localhost:3000

## Environment Variables
The application requires several environment variables to function properly:

### Backend (.env)
- `PORT`: The port on which the server will run (default: 5001)
- `DB_HOST`: MySQL database host (default: localhost)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: studysync)
- `JWT_SECRET`: Secret key for JWT token generation and validation

### Frontend (.env)
- `REACT_APP_API_URL`: URL of the backend API
