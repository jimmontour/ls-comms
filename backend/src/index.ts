import express, { Express, Request, Response } from 'express';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import postRoutes from './routes/posts';
import analyticsRoutes from './routes/analytics';
import oauthRoutes from './routes/oauth';
import linkTreeRoutes from './routes/link-trees';
import resourceRoutes from './routes/resources';
import newsRoutes from './routes/news';
import passportConfig from './config/passport';

dotenv.config();

const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

// Session (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Mock MongoDB connection (for now, using in-memory storage)
console.log('\n✓ Mock database ready (in-memory storage)');
console.log('✓ CORS enabled for LAN access');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/link-trees', linkTreeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/news', newsRoutes);
app.use('/auth', oauthRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', db: 'mock', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ Server running on 0.0.0.0:${PORT}`);
  console.log(`✓ Access from your laptop: http://172.27.28.203:${PORT}`);
  console.log(`✓ Health check: curl http://172.27.28.203:${PORT}/health\n`);
});
