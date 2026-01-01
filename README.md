# HackHub 🚀

A comprehensive dual-interface platform for colleges to manage and participate in hackathons, featuring AI-powered content generation and real-time analytics.

## 📋 Overview

HackHub is a full-stack web application designed to streamline hackathon management for educational institutions. It provides separate interfaces for faculty and students, enabling efficient event creation, registration tracking, and engagement analytics.

### Key Features

- **Dual Role System**: Separate dashboards for faculty and students
- **Event Management**: Create, edit, and manage hackathon listings
- **Real-time Analytics**: Track impressions, registrations, and engagement metrics
- **AI Integration**: Google Gemini AI for content generation and trend analysis
- **Smart Notifications**: Deadline reminders and registration alerts
- **Advanced Filtering**: Search and filter events by platform, deadline, and categories
- **Responsive Design**: Modern UI with Tailwind CSS and smooth animations
- **Section-wise Analytics**: Track participation by student sections

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Routing**: React Router DOM

### Backend (Node.js + Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **AI Integration**: Google Gemini AI (@google/genai)
- **Security**: bcryptjs for password hashing, CORS configuration

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Gemini AI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackhub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Environment Configuration

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/hackhub
JWT_SECRET=your_jwt_secret_key
SEC_KEY=security_key_for_faculty_signup
SHOW_LOGS=1
```

#### Frontend (.env)
```env
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 👥 User Roles & Features

### Faculty Dashboard
- **Event Management**: Create, edit, and delete hackathon listings
- **Analytics Dashboard**: View engagement metrics and registration trends
- **Registration Tracking**: Monitor student registrations by section
- **AI-Powered Tools**: Generate event descriptions and analyze trends
- **Bulk Operations**: Manage multiple events efficiently

### Student Dashboard
- **Event Discovery**: Browse and search available hackathons
- **Smart Filtering**: Filter by platform, deadline, and categories
- **Registration Tracking**: View registered events and deadlines
- **Notifications**: Get alerts for approaching deadlines
- **Profile Management**: Update personal information and skills

## 🛠️ Technical Details

### Database Schema

#### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'STUDENT' | 'FACULTY',
  department: String,
  year: String,
  registerNo: String,
  section: String,
  profilePicture: String (base64),
  bio: String,
  skills: [String]
}
```

#### Hackathons Collection
```javascript
{
  title: String,
  description: String,
  date: String,
  registrationDeadline: String,
  registrationLink: String,
  platform: String,
  location: String,
  prizePool: String,
  categories: [String],
  tags: [String],
  impressions: Number,
  viewedBy: [ObjectId]
}
```

#### Registrations Collection
```javascript
{
  studentName: String,
  email: String,
  studentId: String,
  hackathonId: ObjectId,
  department: String,
  section: String,
  registeredAt: Date
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Hackathons
- `GET /api/hackathons` - Get all hackathons
- `POST /api/hackathons` - Create hackathon
- `PUT /api/hackathons/:id` - Update hackathon
- `DELETE /api/hackathons/:id` - Delete hackathon
- `POST /api/hackathons/:id/impression` - Track impression

#### Registrations
- `GET /api/registrations` - Get all registrations
- `POST /api/registrations` - Create registration

#### AI Services
- `POST /api/ai/generate-description` - Generate event description
- `POST /api/ai/analyze-trends` - Analyze engagement trends

## 🎨 UI/UX Features

- **Glass Morphism Design**: Modern frosted glass effects
- **Smooth Animations**: CSS transitions and keyframe animations
- **Responsive Layout**: Mobile-first design approach
- **Dark Theme**: Consistent dark color scheme
- **Interactive Elements**: Hover effects and micro-interactions
- **Loading States**: Skeleton loaders and progress indicators

## 📊 Analytics & Insights

- **Engagement Metrics**: Track views and registrations
- **Conversion Rates**: Monitor registration success rates
- **Section Performance**: Analyze participation by student sections
- **Trend Analysis**: AI-powered insights on engagement patterns
- **Real-time Updates**: Live data synchronization

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Role-based Access**: Separate permissions for faculty and students

## 🚀 Deployment

### Production Build

1. **Backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

### Environment Variables for Production

Update your production environment variables:
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure proper CORS origins
- Set strong JWT secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development Team

**The QuantumDevs** - CIT's One Stop Hackathon Portal

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**HackHub** - Empowering the next generation of innovators through seamless hackathon management.