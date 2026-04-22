import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// In-memory link trees store
const linkTrees: Map<string, any> = new Map();

// Create link tree
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId, name, slug, description, brandColor, sections } = req.body;
    const userId = (req as any).userId;

    // Check if slug already exists
    const existingSlug = Array.from(linkTrees.values()).find(
      lt => lt.teamId === teamId && lt.slug === slug
    );
    if (existingSlug) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const id = Math.random().toString(36).substring(7);
    const linkTree = {
      _id: id,
      teamId,
      createdBy: userId,
      name,
      slug,
      description,
      brandColor,
      sections,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    linkTrees.set(id, linkTree);
    res.json(linkTree);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create link tree' });
  }
});

// Get team's link trees
router.get('/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teamLinkTrees = Array.from(linkTrees.values())
      .filter(lt => lt.teamId === teamId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(teamLinkTrees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch link trees' });
  }
});

// Get single link tree
router.get('/view/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linkTree = linkTrees.get(id);

    if (!linkTree) {
      return res.status(404).json({ error: 'Link tree not found' });
    }

    res.json(linkTree);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch link tree' });
  }
});

// Update link tree
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linkTree = linkTrees.get(id);

    if (!linkTree) {
      return res.status(404).json({ error: 'Link tree not found' });
    }

    const updated = {
      ...linkTree,
      ...req.body,
      _id: id,
      updatedAt: new Date()
    };

    linkTrees.set(id, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update link tree' });
  }
});

// Delete link tree
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linkTree = linkTrees.get(id);

    if (!linkTree) {
      return res.status(404).json({ error: 'Link tree not found' });
    }

    linkTrees.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete link tree' });
  }
});

export default router;
