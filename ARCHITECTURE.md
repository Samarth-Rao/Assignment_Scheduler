# Assignment Scheduler Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User's Browser                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           React Frontend (Port 3000)                      │  │
│  │  ┌─────────────┬──────────────┬──────────────────────┐   │  │
│  │  │   Login     │  Dashboard   │   Components         │   │  │
│  │  │   Page      │   Page       │  - Header            │   │  │
│  │  │             │              │  - FilterBar         │   │  │
│  │  │             │              │  - AssignmentCard    │   │  │
│  │  └─────────────┴──────────────┴──────────────────────┘   │  │
│  │                                                             │  │
│  │  Theme: Light green (#EFF4EC), accent (#4A7C59)          │  │
│  │  Auto-sync: Every 5 minutes                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↕ (HTTP/REST)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌───────▼─────────┐
        │  Google OAuth  │         │ Backend Server  │
        │  (Auth)        │         │ (Port 5001)     │
        └────────────────┘         └─────────────────┘
                │                           │
                └────────────────┬──────────┘
                                 │
                     ┌───────────▼──────────┐
                     │  Express Routes      │
                     │  ┌────────────────┐  │
                     │  │ /auth/google   │  │
                     │  │ /auth/logout   │  │
                     │  │ /api/classroom │  │
                     │  └────────────────┘  │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼──────────┐
                     │ Google Classroom API│
                     │ - Get courses       │
                     │ - Get assignments   │
                     │ - Get submissions   │
                     │ - Get grades        │
                     └─────────────────────┘
```

## Data Flow

### 1. Login Flow
```
User clicks "Sign in with Google"
    ↓
Frontend redirects to /auth/google
    ↓
Express initiates Passport Google OAuth
    ↓
Google login page (user enters credentials)
    ↓
Google redirects to /auth/google/callback with auth code
    ↓
Backend exchanges code for access token
    ↓
Backend stores user + token in session
    ↓
Frontend redirected to dashboard
    ↓
Dashboard fetches assignments with token
```

### 2. Assignment Sync Flow
```
Dashboard mounts (every 5 min or on manual refresh)
    ↓
Frontend calls GET /api/classroom/assignments
    ↓
Backend verifies user is authenticated
    ↓
Gets user's access token from session
    ↓
Calls Google Classroom API:
  - Fetch all courses
  - For each course:
    - Get all assignments
    - Get student submissions
    - Extract grade info
    ↓
Sort by due date
    ↓
Return JSON to frontend
    ↓
Frontend renders AssignmentCards
    ↓
Shows: title, course, due date, status, grade
```

## Database Schema (Future)

Currently using session storage. For scaling, add MongoDB:

```javascript
// Users collection
{
  _id: ObjectId,
  googleId: string,
  email: string,
  displayName: string,
  photo: string,
  refreshToken: string,
  lastSync: Date
}

// Assignments cache (for faster loading)
{
  _id: ObjectId,
  userId: ObjectId,
  googleAssignmentId: string,
  courseId: string,
  courseName: string,
  title: string,
  dueDate: Date,
  status: string,
  grade: number,
  lastUpdated: Date
}
```

## Security Considerations

✅ **Implemented:**
- Google OAuth 2.0 (industry standard)
- CORS configuration
- Secure session cookies (httpOnly, secure flags)
- User authentication required for API access
- Read-only Classroom scopes for courses and submissions (coursework uses `classroom.coursework.me`, which is not read-only)

🔒 **To Add:**
- Database encryption for refresh tokens
- Rate limiting on API calls
- HTTPS in production
- CSRF protection
- Input validation

## Deployment Architecture

```
Production Setup (Render):
┌──────────────────────────────┐
│  Render Web Service          │
│  Express server (server.js)  │
│   - /auth/*, /api/*          │
│   - serves client/dist       │
│     (React build)            │
└──────────────┬───────────────┘
               │
               │ OAuth + API calls
               │
          ┌────▼────┐
          │ Google  │
          │ APIs    │
          └─────────┘
```

Frontend and backend are deployed together as one Render Web Service
(build: `npm run build`, start: `npm start`). Because the client is served
from the same origin as the API, no separate frontend host or CORS setup is
needed. The server detects Render via the `RENDER` env var (set automatically
by Render) to enable `trust proxy`, secure cookies, and proxy-aware OAuth
callback URLs, and listens on the `PORT` Render provides.

## File Structure

```
Assignment_Scheduler/
│
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Top bar with user info
│   │   │   ├── Header.css
│   │   │   ├── FilterBar.jsx       # Filter tabs
│   │   │   ├── FilterBar.css
│   │   │   ├── AssignmentCard.jsx  # Individual assignment
│   │   │   └── AssignmentCard.css
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Google login UI
│   │   │   ├── LoginPage.css
│   │   │   ├── Dashboard.jsx       # Main view + sync logic
│   │   │   └── Dashboard.css
│   │   ├── App.jsx                 # App root, auth check
│   │   ├── App.css
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles + light theme
│   ├── index.html                  # HTML template
│   ├── package.json
│   └── vite.config.js              # Build config + proxy
│
├── server/                          # Express Backend
│   ├── server.js                   # Express setup + OAuth strategy
│   ├── routes/
│   │   ├── auth.js                 # OAuth login/logout routes
│   │   └── classroom.js            # Classroom API integration
│   ├── package.json
│   └── .env.example                # Environment template
│
├── package.json                    # Root scripts
├── SETUP.md                        # Quick setup guide
├── README.md                       # Full documentation
└── LICENSE

```

## Key Features & How They Work

### Auto-Sync (5 minute interval)
```javascript
// In Dashboard.jsx
useEffect(() => {
  fetchAssignments() // Fetch immediately
  const interval = setInterval(fetchAssignments, 5 * 60 * 1000) // Every 5 min
  return () => clearInterval(interval) // Cleanup
}, [])
```

### Smart Filtering
- **All**: Shows all assignments
- **Upcoming**: `dueDate > now`
- **Pending**: `submissionStatus !== 'TURNED_IN'`
- **Submitted**: `submissionStatus === 'TURNED_IN'`

### Light Theme
Uses CSS custom properties for easy theming:
```css
:root {
  --bg: #EFF4EC;
  --surface: #FAFDF8;
  --accent: #4A7C59;
  /* ... more colors */
}
```

## Performance Optimizations

1. **API Caching** (Future)
   - Cache assignments for 5 minutes
   - Reduce API calls to Google

2. **Lazy Loading** (Future)
   - Load assignments on scroll
   - Pagination

3. **Responsive Images**
   - User avatars cached by Google

4. **Code Splitting** (Future)
   - Lazy load pages

## Development Workflow

```bash
# Clone repo
git clone https://github.com/Samarth-Rao/Assignment_Scheduler.git
cd Assignment_Scheduler

# Install all dependencies
npm run install-all

# Start development servers (runs both client + server)
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5001

# For production (serves API + built client on http://localhost:5001)
npm run build
npm start
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page after login | Check FRONTEND_URL in server/.env |
| 401 Unauthorized | Missing Google scopes in OAuth strategy |
| CORS errors | Check CORS origin in server.js |
| Can't fetch assignments | Verify Classroom API is enabled in Google Cloud |
| Port 5001 in use | Change PORT in server/.env and the proxy target in client/vite.config.js, or kill the process |
