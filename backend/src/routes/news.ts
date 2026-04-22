import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// In-memory stores
const clippings: Map<string, any> = new Map();
const keywordSettings: Map<string, any> = new Map();

// Mock news data (replace with real API calls later)
const mockArticles = [
  {
    title: 'Lake Shore District Expands Advanced Placement Offerings',
    source: 'Buffalo News',
    url: 'https://buffalonews.com/article',
    summary: 'The Lake Shore Central School District announced expansion of Advanced Placement courses...',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    keywords: ['Lake Shore']
  },
  {
    title: 'Angola Community Center Hosts College Prep Fair',
    source: 'Erie County News',
    url: 'https://eriecountynews.com/article',
    summary: 'Local students gathered in Angola for the annual college preparation fair...',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    keywords: ['Angola']
  },
  {
    title: 'Lake Shore Athletics Win Regional Championship',
    source: 'Sports Illustrated',
    url: 'https://si.com/article',
    summary: 'Lake Shore Central School District athletes captured the regional championship...',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    keywords: ['Lake Shore']
  }
];

// Get team's clippings
router.get('/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teamClippings = Array.from(clippings.values())
      .filter(c => c.teamId === teamId)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    res.json(teamClippings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clippings' });
  }
});

// Get settings
router.get('/settings/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const settings = keywordSettings.get(teamId) || {
      keywords: [
        { id: '1', keyword: 'Lake Shore' },
        { id: '2', keyword: 'Angola' }
      ]
    };
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Save settings
router.post('/settings/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { keywords } = req.body;

    keywordSettings.set(teamId, { keywords });
    res.json({ success: true, keywords });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Scan for news
router.post('/scan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;

    // Get keywords for this team
    const settings = keywordSettings.get(teamId) || {
      keywords: [
        { id: '1', keyword: 'Lake Shore' },
        { id: '2', keyword: 'Angola' }
      ]
    };

    const keywords = settings.keywords.map((k: any) => k.keyword);

    // Filter mock articles by keywords
    mockArticles.forEach((article: any) => {
      const matchedKeywords = keywords.filter(kw =>
        article.title.toLowerCase().includes(kw.toLowerCase()) ||
        article.summary.toLowerCase().includes(kw.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        const id = Math.random().toString(36).substring(7);
        const clipping = {
          _id: id,
          teamId,
          title: article.title,
          source: article.source,
          url: article.url,
          summary: article.summary,
          publishedAt: article.publishedAt,
          savedAt: new Date(),
          matchedKeywords
        };
        clippings.set(id, clipping);
      }
    });

    const allClippings = Array.from(clippings.values())
      .filter(c => c.teamId === teamId)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    res.json(allClippings);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Failed to scan news' });
  }
});

// Delete clipping
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clipping = clippings.get(id);

    if (!clipping) {
      return res.status(404).json({ error: 'Clipping not found' });
    }

    clippings.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete clipping' });
  }
});

export default router;
