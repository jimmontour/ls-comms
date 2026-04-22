import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

// In-memory user store for dev
const users: Map<string, any> = new Map();

// Local signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const userId = Math.random().toString(36).substring(7);
    users.set(email, { userId, email, password, name });

    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    // Create default team
    const teamId = Math.random().toString(36).substring(7);

    res.json({ token, user: { id: userId, email, name }, teamId });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Local login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.userId, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
