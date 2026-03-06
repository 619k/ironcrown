import { Router } from 'express';
import { listPunishments } from '../controllers/punishments.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes with JWT and Admin role
router.use(authMiddleware, requireAdmin);

router.get('/', listPunishments);

export default router;
