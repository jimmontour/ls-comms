import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

const platformCredentials: Record<string, { clientId: string; clientSecret: string; redirectUri: string }> = {
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    redirectUri: `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/facebook/callback`
  },
  instagram: {
    clientId: process.env.INSTAGRAM_APP_ID || '',
    clientSecret: process.env.INSTAGRAM_APP_SECRET || '',
    redirectUri: `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/instagram/callback`
  },
  twitter: {
    clientId: process.env.TWITTER_API_KEY || '',
    clientSecret: process.env.TWITTER_API_SECRET || '',
    redirectUri: `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/twitter/callback`
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/linkedin/callback`
  }
};

// Initiate OAuth flow
router.get('/:platform', (req: Request, res: Response) => {
  const { platform } = req.params;
  const token = req.query.token as string;
  const state = req.query.state as string;

  if (!platformCredentials[platform]) {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  const creds = platformCredentials[platform];

  // Store state + token in session for callback
  if (req.session) {
    (req.session as any).oauthState = state;
    (req.session as any).oauthToken = token;
    (req.session as any).platform = platform;
  }

  // If no real credentials, go straight to callback (demo mode)
  if (!creds.clientId || creds.clientId.startsWith('YOUR_')) {
    return res.redirect(`/auth/${platform}/callback?code=demo_code_${Date.now()}&state=${state}`);
  }

  // Real OAuth URLs
  let authUrl = '';
  switch (platform) {
    case 'facebook':
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${creds.clientId}&redirect_uri=${encodeURIComponent(creds.redirectUri)}&scope=pages_manage_posts,pages_read_engagement&state=${state}`;
      break;
    case 'instagram':
      authUrl = `https://www.instagram.com/oauth/authorize?client_id=${creds.clientId}&redirect_uri=${encodeURIComponent(creds.redirectUri)}&scope=user_profile,instagram_basic,instagram_graph_user_media&response_type=code&state=${state}`;
      break;
    case 'twitter':
      authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${creds.clientId}&redirect_uri=${encodeURIComponent(creds.redirectUri)}&scope=tweet.write%20users.read%20follows.read%20follows.write&response_type=code&state=${state}`;
      break;
    case 'linkedin':
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${creds.clientId}&redirect_uri=${encodeURIComponent(creds.redirectUri)}&scope=w_member_social&response_type=code&state=${state}`;
      break;
  }

  if (!authUrl) {
    return res.status(400).json({ error: 'OAuth not configured for this platform' });
  }

  res.redirect(authUrl);
});

// OAuth callback handlers
router.get('/:platform/callback', (req: Request, res: Response) => {
  const { platform } = req.params;
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`http://localhost:3002/settings?error=${error}`);
  }

  if (!code) {
    return res.redirect(`http://localhost:3002/settings?error=no_code`);
  }

  // Mock: In a real app, exchange code for access token here
  // For demo, just simulate success and redirect back
  console.log(`✓ OAuth callback for ${platform} (code: ${code})`);
  
  res.redirect(`http://localhost:3002/settings?connected=${platform}`);
});

export default router;
