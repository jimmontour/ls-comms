import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// In-memory account store
const accounts: Map<string, any> = new Map();

// List team's connected accounts
router.get('/:teamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teamAccounts = Array.from(accounts.values()).filter(a => a.teamId === teamId);
    res.json(teamAccounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Disconnect account
router.delete('/:accountId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    accounts.delete(accountId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

export default router;
