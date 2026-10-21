# Thoth Assignment Scheduler

A modern, light-themed web application that integrates with Google Classroom to display your assignments and grades in one place.

## Features

- 🔐 **Google OAuth Login** - Secure authentication with your school Google account
- 📚 **Real-time Sync** - Automatically fetches assignments and grades from Google Classroom
- 🎯 **Smart Filtering** - Filter by all, upcoming, pending, or submitted assignments
- ⚡ **Fast & Responsive** - Smooth UI with no extra clicks needed
- 📱 **Mobile Friendly** - Works great on phones and tablets

# Website

https://assignment-scheduler-gbnm.onrender.com/

## Tech Stack

**Frontend:**
- React with Vite
- CSS3 with CSS Variables
- Axios for API calls
- date-fns for date formatting

**Backend:**
- Node.js with Express
- Google OAuth 2.0
- Passport.js for authentication
- Google Classroom API

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Google Cloud Project with Classroom API enabled

### Setup

#### 1. Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Classroom API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`
6. Copy your Client ID and Client Secret

#### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

Update `.env` with your Google credentials:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

Start the server:
```bash
npm run dev
```

#### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:3000` and sign in with your Google account.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── App.jsx
│   └── index.html
│
└── server/                # Node.js backend
    ├── routes/
    │   ├── auth.js       # Google OAuth routes
    │   └── classroom.js  # Classroom API integration
    └── server.js
```

## Features Explained

### Smart Assignment Display
Shows:
- Assignment title and course
- Due date with relative time ("in 2 days")
- Submission status (pending/submitted/overdue)
- Grade when available
- Assignment description (truncated)

### Auto-Sync
- Fetches assignments automatically every 5 minutes
- Shows last update timestamp
- Handles API errors gracefully

### Filtering
- **All** - All assignments
- **Upcoming** - Assignments with future due dates
- **Pending** - Unsubmitted assignments
- **Submitted** - Already turned in assignments

## Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=xxx
```

## Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Calendar view
- [ ] Push notifications for due dates
- [ ] Grade tracker with statistics
- [ ] Assignment submission directly from app
- [ ] Multiple account support
- [ ] Docker containerization
- [ ] Database integration for caching
- [ ] Rebuild with Java backend

## Deployment

### Vercel (Frontend)
```bash
cd client
npm run build
# Connect to Vercel
```

### Heroku (Backend)
```bash
cd server
# Deploy to Heroku
```

Make sure to update `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` in production.

## License

GPLv3.0

## Support

For issues and feature requests, please open an issue on GitHub.
