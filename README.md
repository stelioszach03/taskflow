# TaskFlow - Modern Task Management Application

![TaskFlow Banner](https://via.placeholder.com/1200x300/6366f1/FFFFFF?text=TaskFlow+-+Modern+Task+Management)

TaskFlow is a full-stack task management application that allows users to create, assign, and track tasks in an intuitive and visually appealing interface. Built with React, Node.js, Express, and MongoDB, it provides a modern solution for team collaboration and project management.

## 🌟 Features

- **User Authentication & Authorization**
  - Register and login with JWT authentication
  - Role-based access control (Admin & User roles)
  - Profile management
  
- **Task Management**
  - Create, read, update, and delete tasks
  - Assign tasks to team members
  - Track task status (Pending, In Progress, Completed)
  - Set priority levels and due dates
  - Add labels to categorize tasks
  
- **Interactive UI**
  - Responsive dashboard with task statistics
  - Kanban board with drag-and-drop functionality
  - Task list with filtering, search, and pagination
  - Dark/Light mode with customizable primary color
  
- **Team Collaboration**
  - View team members
  - Assign tasks to multiple users
  - Track who created and modified tasks

- **Admin Controls**
  - User management
  - Role assignment
  - Application settings

## 🖥️ Screenshots

<div align="center">
  <img src="https://via.placeholder.com/400x225/6366f1/FFFFFF?text=Dashboard" alt="Dashboard" width="400" />
  <img src="https://via.placeholder.com/400x225/6366f1/FFFFFF?text=Kanban+Board" alt="Kanban Board" width="400" />
  <img src="https://via.placeholder.com/400x225/6366f1/FFFFFF?text=Task+List" alt="Task List" width="400" />
  <img src="https://via.placeholder.com/400x225/6366f1/FFFFFF?text=Task+Details" alt="Task Details" width="400" />
</div>

## 🛠️ Technologies Used

### Frontend
- **React** - UI library
- **React Router** - Navigation and routing
- **Context API** - State management
- **Tailwind CSS** - Styling and UI components
- **Axios** - API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or above)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### Clone the repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# PORT=5001
# NODE_ENV=development

# Start the server
npm start
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

## 📂 Project Structure

```
taskflow/
├── backend/               # Backend codebase
│   ├── config/            # Configuration files
│   ├── controllers/       # Request controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── server.js          # Entry point
│
├── frontend/              # Frontend codebase
│   ├── public/            # Public assets
│   └── src/               # Source code
│       ├── assets/        # Static assets
│       ├── components/    # React components
│       ├── context/       # Context providers
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── utils/         # Utility functions
│
└── README.md              # Project documentation
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/assign` - Assign task to user
- `POST /api/tasks/:id/unassign` - Unassign task from user
- `PUT /api/tasks/:id/status` - Update task status

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## 📱 Responsive Design

TaskFlow is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security Features

- JWT for secure authentication
- Password hashing with bcrypt
- Protected routes on both frontend and backend
- Role-based access control
- Input validation and sanitization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**  
- GitHub: [@stelioszach03](https://github.com/stelioszach03)
- LinkedIn: [Stelios Zacharioudakis](https://linkedin.com/in/yourprofile)
- Email: sjzacha@gmail.com

---

⭐️ From [Stelios Zacharioudakis](https://github.com/stelioszach03) ⭐️
