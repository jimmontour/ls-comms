# SocialHub Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (local or Cloud)
- OAuth apps registered for each platform

## 1. Register OAuth Apps

### Facebook / Instagram
1. Go to https://developers.facebook.com
2. Create a new app (Business type)
3. Add Facebook Login product
4. Set redirect URI: `http://localhost:5000/auth/facebook/callback`
5. Get App ID and App Secret

### X (Twitter)
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new app
3. Generate API Key and API Secret (v2 API)
4. Set redirect URI: `http://localhost:5000/auth/x/callback`

### LinkedIn
1. Go to https://www.linkedin.com/developers/apps
2. Create a new app
3. Get Client ID and Client Secret
4. Redirect URI: `http://localhost:5000/auth/linkedin/callback`

## 2. Backend Setup

```bash
cd backend
npm install

# Create .env.local with your credentials
cp .env.example .env.local
```

Fill in `.env.local`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-scheduler
JWT_SECRET=your-secret-key-here
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
ENCRYPTION_KEY=your-32-char-encryption-key-here

# OAuth credentials from step 1
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
# ... etc
```

Start backend:
```bash
npm run dev
```

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## 4. Test Flow

1. Sign up for an account
2. Go to Settings
3. Click "Connect Facebook" (or other platform)
4. Authorize the app
5. You should see your account listed
6. Create a post and schedule it
7. Watch Bull queue process the post

## 5. Production Deployment

### Backend (e.g., Render)
- Set environment variables in dashboard
- Deploy from GitHub
- Use MongoDB Atlas and Redis Cloud
- Update BACKEND_URL and FRONTEND_URL

### Frontend (e.g., Vercel)
- Connect GitHub repo
- Set VITE_API_URL env var
- Deploy

## Troubleshooting

### "OAuth token failed"
- Check your app credentials in .env.local
- Verify redirect URIs match exactly
- Clear browser cookies and try again

### "Post failed to publish"
- Check Bull queue logs (Redis connection)
- Verify platform access token hasn't expired
- Check platform API limits

### "Token decryption failed"
- Ensure ENCRYPTION_KEY is 32+ characters
- Key must be same across all instances

## Next: Features to Add

1. **Media uploads** — S3 or similar for image/video storage
2. **Team management** — Proper roles and permissions
3. **Calendar UI** — Better scheduling visualization
4. **Engagement analytics** — Platform API integration for metrics
5. **Scheduling templates** — Recurring posts
6. **Draft saving** — Auto-save composer state
7. **Rich media preview** — Show post preview before publish
