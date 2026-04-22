import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// In-memory posts store
const posts: Map<string, any> = new Map();
const queue: any[] = []; // Bull queue placeholder

// Create scheduled post
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId, content, mediaUrls, scheduledFor, accounts } = req.body;
    const userId = (req as any).userId;

    const postId = Math.random().toString(36).substring(7);
    const post = {
      _id: postId,
      teamId,
      createdBy: userId,
      content,
      mediaUrls,
      scheduledFor: new Date(scheduledFor),
      accounts,
      status: 'scheduled',
      createdAt: new Date()
    };

    posts.set(postId, post);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// List team's posts
router.get('/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teamPosts = Array.from(posts.values())
      .filter(p => p.teamId === teamId)
      .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime());
    
    res.json(teamPosts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Update post
router.put('/:postId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = posts.get(postId);

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.status === 'published') {
      return res.status(400).json({ error: 'Cannot edit published posts' });
    }

    const updated = { ...post, ...req.body };
    posts.set(postId, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Publish post now
router.post('/:postId/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = posts.get(postId);

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.status === 'published') {
      return res.status(400).json({ error: 'Already published' });
    }

    post.status = 'published';
    post.publishedAt = new Date();
    posts.set(postId, post);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// Delete post
router.delete('/:postId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = posts.get(postId);

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.status === 'published') {
      return res.status(400).json({ error: 'Cannot delete published posts' });
    }

    posts.delete(postId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
