import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// In-memory resources store
const resources: Map<string, any> = new Map();

// Create resource library
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId, name, slug, description, department, categories } = req.body;
    const userId = (req as any).userId;

    // Check if slug already exists
    const existingSlug = Array.from(resources.values()).find(
      r => r.teamId === teamId && r.slug === slug
    );
    if (existingSlug) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const id = Math.random().toString(36).substring(7);
    const resource = {
      _id: id,
      teamId,
      createdBy: userId,
      name,
      slug,
      description,
      department,
      categories,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    resources.set(id, resource);
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource library' });
  }
});

// Get team's resources
router.get('/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teamResources = Array.from(resources.values())
      .filter(r => r.teamId === teamId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(teamResources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get single resource
router.get('/view/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = resources.get(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Update resource
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = resources.get(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const updated = {
      ...resource,
      ...req.body,
      _id: id,
      updatedAt: new Date()
    };

    resources.set(id, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete resource
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = resources.get(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    resources.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Public route - get resource by slug (no auth required)
router.get('/public/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const resource = Array.from(resources.values()).find(r => r.slug === slug);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

export default router;
