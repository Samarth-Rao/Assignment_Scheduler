import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getClassroomData } from './routes/classroom.js';
import { authRoutes } from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env regardless of the working directory (e.g. `npm start` from repo root)
dotenv.config({ path: path.join(__dirname, '.env') });

// Render sets RENDER=true automatically; use it to detect production
const IS_PRODUCTION = !!process.env.RENDER;

const app = express();
const PORT = process.env.PORT || 5001;

if (IS_PRODUCTION) app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: IS_PRODUCTION ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true, // reset expiry on every request (inactivity timeout)
  cookie: {
    secure: IS_PRODUCTION,
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000 // log out after 8 hours of inactivity
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  proxy: IS_PRODUCTION
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.emails?.[0]?.value,
    accessToken,
    refreshToken,
    photo: profile.photos?.[0]?.value
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.use('/auth', authRoutes);

// Protected route - Get classroom data
app.get('/api/classroom/assignments', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  getClassroomData(req.user.accessToken)
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// Serve React frontend
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) res.status(404).send('Run npm run build in /client first');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
