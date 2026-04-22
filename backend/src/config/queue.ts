import Bull from 'bull';
import Redis from 'redis';
import ScheduledPost from '../models/ScheduledPost';
import ConnectedAccount from '../models/ConnectedAccount';
import Analytics from '../models/Analytics';
import axios from 'axios';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32-chars-long-here-xxxx';

const decryptToken = (encrypted: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), Buffer.alloc(16, 0));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Create queue
export const publishQueue = new Bull('post-publishing', process.env.REDIS_URL || 'redis://localhost:6379');

// Process publishing jobs
publishQueue.process(async (job) => {
  const { postId, accountId } = job.data;

  try {
    const post = await ScheduledPost.findById(postId);
    const account = await ConnectedAccount.findById(accountId);

    if (!post || !account) {
      throw new Error('Post or account not found');
    }

    // Decrypt token
    const accessToken = decryptToken(account.accessToken);

    let publishedPostId: string;

    switch (account.platform) {
      case 'facebook':
        publishedPostId = await publishToFacebook(post.content, accessToken, account.accountId, post.mediaUrls);
        break;

      case 'instagram':
        publishedPostId = await publishToInstagram(post.content, accessToken, account.accountId, post.mediaUrls);
        break;

      case 'x':
        const tokens = JSON.parse(accessToken);
        publishedPostId = await publishToX(post.content, tokens.token, tokens.tokenSecret, post.mediaUrls);
        break;

      case 'linkedin':
        publishedPostId = await publishToLinkedIn(post.content, accessToken, account.accountId, post.mediaUrls);
        break;

      default:
        throw new Error(`Unknown platform: ${account.platform}`);
    }

    // Update post with published info
    post.status = 'published';
    post.publishedAt = new Date();
    post.publishedPostIds = post.publishedPostIds || [];
    post.publishedPostIds.push({
      platform: account.platform,
      postId: publishedPostId
    });
    await post.save();

    // Schedule analytics sync (fetch engagement after 1 hour)
    await publishQueue.add(
      { postId: post._id, accountId, platform: account.platform, platformPostId: publishedPostId },
      { delay: 60 * 60 * 1000, jobId: `analytics-${postId}-${accountId}` }
    );

    return { success: true, publishedPostId };
  } catch (err: any) {
    // Retry up to 3 times
    if (job.attemptsMade < 3) {
      throw err;
    }

    // Mark as failed after retries exhausted
    const post = await ScheduledPost.findById(job.data.postId);
    if (post) {
      post.status = 'failed';
      post.errorMessage = err.message;
      await post.save();
    }

    throw err;
  }
});

// Helper: Publish to Facebook
async function publishToFacebook(content: string, accessToken: string, pageId: string, mediaUrls?: string[]): Promise<string> {
  try {
    const data: any = {
      message: content,
      access_token: accessToken
    };

    if (mediaUrls && mediaUrls.length > 0) {
      data.source = mediaUrls[0]; // First image
    }

    const response = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, data);
    return response.data.id;
  } catch (err: any) {
    throw new Error(`Facebook publish failed: ${err.response?.data?.error?.message || err.message}`);
  }
}

// Helper: Publish to Instagram
async function publishToInstagram(content: string, accessToken: string, igUserId: string, mediaUrls?: string[]): Promise<string> {
  try {
    // Instagram requires creating container first, then publishing
    const containerData = {
      image_url: mediaUrls?.[0] || '',
      caption: content,
      access_token: accessToken
    };

    const containerRes = await axios.post(`https://graph.instagram.com/v18.0/${igUserId}/media`, containerData);
    const containerId = containerRes.data.id;

    const publishRes = await axios.post(
      `https://graph.instagram.com/v18.0/${igUserId}/media_publish`,
      { creation_id: containerId, access_token: accessToken }
    );

    return publishRes.data.id;
  } catch (err: any) {
    throw new Error(`Instagram publish failed: ${err.response?.data?.error?.message || err.message}`);
  }
}

// Helper: Publish to X (Twitter)
async function publishToX(content: string, token: string, tokenSecret: string, mediaUrls?: string[]): Promise<string> {
  try {
    // Using v2 API - requires proper OAuth1.0a signing
    // This is simplified; real implementation needs oauth1 signature
    const response = await axios.post('https://api.twitter.com/2/tweets', {
      text: content
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data.id;
  } catch (err: any) {
    throw new Error(`X publish failed: ${err.response?.data?.detail || err.message}`);
  }
}

// Helper: Publish to LinkedIn
async function publishToLinkedIn(content: string, accessToken: string, personalId: string, mediaUrls?: string[]): Promise<string> {
  try {
    const postData = {
      commentary: content,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED'
      }
    };

    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      }
    });

    return response.data.id;
  } catch (err: any) {
    throw new Error(`LinkedIn publish failed: ${err.response?.data?.message || err.message}`);
  }
}

// Helper: Sync analytics from platform
async function syncAnalytics(postId: string, platform: string, platformPostId: string, accessToken?: string) {
  try {
    // Platform-specific analytics fetching
    // This is a placeholder — implement per-platform logic
    console.log(`Syncing analytics for ${platform} post ${platformPostId}`);

    // Store in Analytics model
    // Real implementation would fetch actual metrics from API
  } catch (err) {
    console.error(`Failed to sync analytics: ${err}`);
  }
}

// Schedule recurring job to publish scheduled posts
export function startPublishingScheduler() {
  publishQueue.add(
    { type: 'check-scheduled' },
    { repeat: { every: 60000 } } // Check every minute
  );

  publishQueue.process('check-scheduled', async (job) => {
    // Find all posts scheduled for the next minute
    const now = new Date();
    const oneMinuteAhead = new Date(now.getTime() + 60000);

    const postsToPublish = await ScheduledPost.find({
      status: 'scheduled',
      scheduledFor: { $gte: now, $lte: oneMinuteAhead }
    }).populate('accounts');

    for (const post of postsToPublish) {
      for (const account of post.accounts) {
        // Add publish job to queue
        await publishQueue.add(
          { postId: post._id, accountId: account.accountId },
          { priority: 10 }
        );
      }
    }

    return { checkedAt: now, found: postsToPublish.length };
  });
}

export default publishQueue;
