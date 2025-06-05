# TaskFlow - Professional Task Management Application

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Professional%20Task%20Management-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

TaskFlow is a premium, enterprise-grade task management application featuring a stunning modern UI, smooth animations, and comprehensive project management capabilities. Built with React, Node.js, Express, and MongoDB, it delivers an exceptional user experience with professional-grade security and performance.

## ✨ Key Features

### 🎨 Modern UI/UX
- **Glass-morphism Design**: Beautiful frosted glass effects throughout the interface
- **Smooth Animations**: Powered by Framer Motion for delightful page transitions and micro-interactions
- **Dark Mode**: Full dark mode support with smooth theme transitions
- **Responsive Design**: Mobile-first approach that works flawlessly on all devices
- **Custom Components**: Professional UI components with hover effects and visual feedback

### 📋 Advanced Task Management
- **Multiple Views**: Switch between list view, grid view, and Kanban board
- **Drag & Drop**: Intuitive drag-and-drop functionality in Kanban view with smooth animations
- **Rich Text Editor**: Format task descriptions with a full-featured rich text editor
- **File Attachments**: Upload and preview images, PDFs, and documents
- **Real-time Search**: Lightning-fast search with live filtering
- **Smart Filters**: Filter by status, priority, assignee, and custom tags
- **Bulk Operations**: Select and update multiple tasks at once

### 🔐 Enterprise-Grade Security
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Input Validation**: Comprehensive validation using express-validator and Yup
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **XSS Protection**: Input sanitization and content security policies
- **Password Security**: Strong password requirements with bcrypt hashing
- **CORS Configuration**: Secure cross-origin resource sharing

### 🚀 Performance & Reliability
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Loading States**: Skeleton loaders and progress indicators
- **Network Detection**: Automatic offline/online status monitoring
- **Request Retry**: Automatic retry logic for failed requests
- **Optimistic Updates**: Instant UI updates with background synchronization

### 👥 Team Collaboration
- **User Assignment**: Assign tasks to team members with search functionality
- **Activity Feed**: Real-time activity tracking and notifications
- **Team Dashboard**: Overview of team performance and statistics
- **Comments System**: Add comments and updates to tasks

## 🎯 What's New & Enhanced

### Latest Enhancements
- ✅ **Premium UI Components**: Glass-morphism cards, gradient backgrounds, and floating labels
- ✅ **Advanced Animations**: Page transitions, hover effects, and drag animations
- ✅ **Enhanced Forms**: Real-time validation, floating labels, and rich text editing
- ✅ **Improved Security**: Rate limiting, input sanitization, and refresh tokens
- ✅ **Better Error Handling**: Toast notifications, error boundaries, and network status
- ✅ **Performance Optimizations**: Request caching, lazy loading, and optimistic updates

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI library with hooks and context
- **Framer Motion** - Production-ready animation library
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Icons** - Popular icon libraries
- **React Hot Toast** - Beautiful toast notifications
- **React Hook Form** - Performant forms with validation
- **Yup** - Schema validation
- **@dnd-kit** - Modern drag and drop
- **React Quill** - Rich text editor
- **React Datepicker** - Date selection
- **Axios** - HTTP client with interceptors

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Fast, minimalist web framework
- **MongoDB** - NoSQL database
- **Mongoose 8** - Elegant MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting middleware
- **Express Validator** - Input validation
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variables

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. **Quick Start (Recommended)**
   ```bash
   ./scripts/start-dev.sh
   ```
   
   This script will:
   - Check prerequisites
   - Install dependencies if needed
   - Set up environment files
   - Start MongoDB (if installed)
   - Launch both frontend and backend
   - Monitor services for crashes

3. **Manual Setup**
   
   a. **Install dependencies**
   ```bash
   npm run install-all
   ```
   
   b. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   ```
   
   c. **Start MongoDB** (if using local installation)
   ```bash
   mongod
   ```
   
   d. **Run the application**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### First Time Setup

1. The application will open in your browser
2. Click "Register" to create your first account
3. Login with your credentials
4. Start creating tasks and exploring features!

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route controllers (auth, tasks, users)
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/         # MongoDB schemas (User, Task, RefreshToken)
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions
│   ├── .env.example    # Environment variables template
│   └── server.js       # Express server entry point
│
├── frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # Reusable React components
│       │   ├── Auth/   # Login, Register, Profile
│       │   ├── Common/ # Alert, Loader, ErrorBoundary
│       │   ├── Navigation/ # Navbar, Sidebar
│       │   └── Tasks/  # TaskList, TaskForm, TaskItem
│       ├── context/    # Global state management
│       ├── hooks/      # Custom React hooks
│       ├── pages/      # Page components
│       ├── services/   # API services and utilities
│       └── utils/      # Helper functions
│
├── package.json        # Root package with scripts
└── README.md          # You are here!
```

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install-all` - Install all dependencies for the project
- `npm run build` - Build frontend for production
- `npm run build:full` - Install dependencies and build
- `npm run start:prod` - Start backend in production mode
- `npm run deploy` - Full deployment script

### Backend Scripts
- `npm run dev` - Start with nodemon for development
- `npm start` - Start server in production mode

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests

## 🔐 Environment Variables

The application uses environment variables for configuration. Copy `backend/.env.example` to `backend/.env` and update:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET` | Secret for JWT tokens | Required - Generate secure key |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Required - Generate secure key |
| `SESSION_SECRET` | Express session secret | Required - Generate secure key |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

To generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Deployment

### Building for Production

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   CLIENT_URL=https://your-domain.com
   # Use strong, unique secrets in production
   ```

3. **Deploy Options**
   - **Frontend**: Deploy `frontend/build` to Netlify, Vercel, or any static hosting
   - **Backend**: Deploy to Heroku, DigitalOcean, AWS, or any Node.js hosting
   - **Database**: Use MongoDB Atlas for cloud database

### Docker Support (Coming Soon)
- Dockerfile for easy containerization
- Docker Compose for full stack deployment
- Kubernetes configurations for scaling

## 🛡️ Security Best Practices

- Always use HTTPS in production
- Set strong, unique values for all secret keys
- Enable MongoDB authentication
- Keep dependencies updated
- Use environment variables for sensitive data
- Implement proper backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Stelios Zacharioudakis**  
- GitHub: [@stelioszach03](https://github.com/stelioszach03)
- Email: sjzacha@gmail.com

## 🙏 Acknowledgments

- React team for the amazing UI library
- Framer Motion for smooth animations
- Tailwind CSS for the utility-first approach
- All open source contributors

---

⭐️ If you find this project useful, please consider giving it a star! ⭐️
