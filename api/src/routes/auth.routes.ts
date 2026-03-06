import { Router } from 'express';
import { login, logout, me, refresh } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

export default router;
