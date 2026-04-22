# LS Comms - Multi-Platform Social Media Scheduler for Lake Shore

A Buffer-like social media scheduling app with OAuth integration for Facebook, Instagram, X, and LinkedIn.

## Architecture

```
frontend/          React + TypeScript + Tailwind (dark theme + emerald accents)
backend/           Express + MongoDB + Bull Queue
```

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env.local
# Fill in your OAuth credentials
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## Environment Variables

### Backend (.env.local)

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for signing JWTs
- `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` — Facebook OAuth app credentials
- `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` — Instagram Graph API credentials
- `X_API_KEY` / `X_API_SECRET` — X (Twitter) API credentials
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` — LinkedIn OAuth credentials
- `REDIS_URL` — Redis connection for Bull queue
- `ENCRYPTION_KEY` — Key for encrypting stored tokens

### Frontend (.env.local)

- `VITE_API_URL` — Backend API URL (default: http://localhost:5000/api)

## Features

- **Multi-platform posting** — Schedule to Facebook, Instagram, X, LinkedIn simultaneously
- **Team management** — Share accounts and schedules across team members
- **OAuth authentication** — No exposed credentials; tokens managed server-side
- **Post scheduling** — Simple date/time picker
- **Analytics** — Basic engagement counts (likes, comments, shares)
- **Secure token storage** — All OAuth tokens encrypted before storage

## API Endpoints

### Auth
- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Sign in

### Accounts
- `GET /api/accounts/:teamId` — List connected accounts
- `DELETE /api/accounts/:accountId` — Disconnect account
- `GET /api/accounts/oauth/:platform/:teamId` — Get OAuth redirect URL

### Posts
- `POST /api/posts` — Create scheduled post
- `GET /api/posts/:teamId` — List team's posts
- `PUT /api/posts/:postId` — Update post (draft/scheduled only)
- `DELETE /api/posts/:postId` — Delete post

### Analytics
- `GET /api/analytics/post/:postId` — Analytics for single post
- `GET /api/analytics/team/:teamId` — Team analytics summary

## Next Steps

1. Set up OAuth apps for each platform
2. Implement platform-specific publishing logic (in Bull queue worker)
3. Add media upload support
4. Implement analytics sync via platform APIs
5. Add user/team management UI
6. Deploy to production (Render, Vercel, etc.)

## Production Checklist

- [ ] Set up proper MongoDB (Atlas, etc.)
- [ ] Set up Redis for Bull queue
- [ ] Implement proper error logging
- [ ] Add rate limiting
- [ ] Add request validation (joi/zod)
- [ ] Set up CORS properly for your domain
- [ ] Use environment variables for all secrets
- [ ] Add database backups
- [ ] Set up email notifications for failed posts
- [ ] Implement refresh token rotation for OAuth tokens
