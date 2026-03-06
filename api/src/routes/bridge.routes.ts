import { Router } from 'express';
import { apiKeyMiddleware } from '../middleware/apikey.middleware';
import { ipWhitelistMiddleware } from '../middleware/ipWhitelist.middleware';
import { bridgeLimiter } from '../middleware/rateLimiter';
import {
    heartbeat, playerSync, inventorySync,
    eventLog, getPendingJobs, jobResult,
} from '../controllers/bridge.controller';

const router = Router();

// All bridge routes: IP whitelist + API key + rate limit
router.use(ipWhitelistMiddleware, apiKeyMiddleware, bridgeLimiter);

router.post('/heartbeat', heartbeat);
router.post('/player-sync', playerSync);
router.post('/inventory-sync', inventorySync);
router.post('/event-log', eventLog);
router.get('/jobs/pending', getPendingJobs);
router.post('/jobs/:id/result', jobResult);

export default router;
