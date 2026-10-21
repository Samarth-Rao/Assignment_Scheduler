# Quick Setup Guide for Assignment Scheduler

## Step 1: Google Cloud Project Setup
1. Visit https://console.cloud.google.com/
2. Create a new project named "Assignment Scheduler"
3. Search for and enable these APIs:
   - Google Classroom API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`
7. Download JSON credentials
8. Copy `client_id` and `client_secret`

## Step 2: Configure Environment
```bash
# Create server environment file
cd server
cp .env.example .env
```

Edit `server/.env`:
```
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
SESSION_SECRET=generate_a_random_string_here
```

## Step 3: Install Dependencies
From root directory:
```bash
npm run install-all
```

## Step 4: Run Development Servers
From root directory:
```bash
npm run dev
```

This will start:
- Backend: http://localhost:5001
- Frontend: http://localhost:3000

## Step 5: Login & Test
1. Open http://localhost:3000
2. Click "Sign in with Google"
3. Select your school Google account
4. Allow permissions for Google Classroom
5. View your assignments!

## Troubleshooting

**Blank page after login?**
- Check browser console for errors (F12)
- Ensure backend is running on port 5001
- Check that CORS is configured correctly

**Classroom API not working?**
- Verify the API is enabled in Google Cloud Console
- Double-check Client ID and Secret are correct
- Make sure redirect URL matches exactly

**Port already in use?**
- Change PORT in `server/.env` and the proxy target in `client/vite.config.js`
- Update FRONTEND_URL if needed

## Project Structure
```
Assignment_Scheduler/
├── client/          # React frontend (port 3000)
├── server/          # Express backend (port 5001)
├── package.json     # Root scripts
└── README.md        # Full documentation
```

## Next Steps
- [x] Deploy to Render (single web service; see README "Deployment")
- [ ] Add database for caching
- [ ] Implement grade tracking
- [ ] Add calendar view
