import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User';
import ConnectedAccount from '../models/ConnectedAccount';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32-chars-long-here-xxxx';

// Helper: encrypt tokens before storage
const encryptToken = (token: string): string => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), Buffer.alloc(16, 0));
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Facebook OAuth
passport.use('facebook', new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
  passReqToCallback: true,
  scope: ['pages_manage_posts', 'pages_read_engagement']
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const userId = (req as any).user?.id;
    const teamId = (req as any).query?.state;

    if (!userId || !teamId) {
      return done(new Error('Missing user or team context'));
    }

    const account = await ConnectedAccount.findOneAndUpdate(
      { userId, platform: 'facebook', accountId: profile.id },
      {
        userId,
        teamId,
        platform: 'facebook',
        accountId: profile.id,
        accountName: profile.displayName,
        accountImage: profile.photos?.[0]?.value,
        accessToken: encryptToken(accessToken),
        refreshToken: refreshToken ? encryptToken(refreshToken) : undefined,
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    done(null, account);
  } catch (err) {
    done(err);
  }
}));

// Instagram OAuth (via Graph API)
passport.use('instagram', new FacebookStrategy({
  clientID: process.env.INSTAGRAM_APP_ID!,
  clientSecret: process.env.INSTAGRAM_APP_SECRET!,
  callbackURL: `${process.env.BACKEND_URL}/auth/instagram/callback`,
  passReqToCallback: true,
  scope: ['instagram_basic', 'instagram_graph_user_media']
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const userId = (req as any).user?.id;
    const teamId = (req as any).query?.state;

    if (!userId || !teamId) {
      return done(new Error('Missing user or team context'));
    }

    const account = await ConnectedAccount.findOneAndUpdate(
      { userId, platform: 'instagram', accountId: profile.id },
      {
        userId,
        teamId,
        platform: 'instagram',
        accountId: profile.id,
        accountName: profile.displayName,
        accountImage: profile.photos?.[0]?.value,
        accessToken: encryptToken(accessToken),
        refreshToken: refreshToken ? encryptToken(refreshToken) : undefined,
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    done(null, account);
  } catch (err) {
    done(err);
  }
}));

// X (Twitter) OAuth
passport.use('x', new TwitterStrategy({
  consumerKey: process.env.X_API_KEY!,
  consumerSecret: process.env.X_API_SECRET!,
  callbackURL: `${process.env.BACKEND_URL}/auth/x/callback`,
  passReqToCallback: true
}, async (req, token, tokenSecret, profile, done) => {
  try {
    const userId = (req as any).user?.id;
    const teamId = (req as any).query?.state;

    if (!userId || !teamId) {
      return done(new Error('Missing user or team context'));
    }

    // For X, store both token and secret
    const combinedToken = JSON.stringify({ token, tokenSecret });

    const account = await ConnectedAccount.findOneAndUpdate(
      { userId, platform: 'x', accountId: profile.id },
      {
        userId,
        teamId,
        platform: 'x',
        accountId: profile.id,
        accountName: profile.screen_name,
        accountImage: profile.profile_image_url,
        accessToken: encryptToken(combinedToken),
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    done(null, account);
  } catch (err) {
    done(err);
  }
}));

// LinkedIn OAuth
passport.use('linkedin', new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  callbackURL: `${process.env.BACKEND_URL}/auth/linkedin/callback`,
  passReqToCallback: true,
  scope: ['openid', 'profile', 'email', 'w_member_social']
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const userId = (req as any).user?.id;
    const teamId = (req as any).query?.state;

    if (!userId || !teamId) {
      return done(new Error('Missing user or team context'));
    }

    const account = await ConnectedAccount.findOneAndUpdate(
      { userId, platform: 'linkedin', accountId: profile.id },
      {
        userId,
        teamId,
        platform: 'linkedin',
        accountId: profile.id,
        accountName: profile.displayName,
        accountImage: profile.photos?.[0]?.value,
        accessToken: encryptToken(accessToken),
        refreshToken: refreshToken ? encryptToken(refreshToken) : undefined,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // LinkedIn tokens expire in 1 hour
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    done(null, account);
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
