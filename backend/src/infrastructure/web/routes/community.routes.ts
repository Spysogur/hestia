import { Router } from 'express';
import { Container } from '../../di/container';
import { createAuthMiddleware } from '../../auth/authMiddleware';
import { validate } from '../middleware/validate';
import { createCommunitySchema } from '../validation/community.schema';

export function createCommunityRouter(container: Container): Router {
  const router = Router();
  const auth = createAuthMiddleware(container.jwtService);

  // GET /api/v1/communities
  router.get('/', async (_req, res, next) => {
    try {
      const communities = await container.repositories.communityRepository.findAll();
      res.json({ status: 'success', data: communities });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/communities/nearby?lat=X&lng=Y&radius=Z
  // Must be declared before /:id to avoid route conflict
  router.get('/nearby', async (req, res, next) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat((req.query.radius as string) ?? '50');

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ status: 'error', message: 'lat and lng query params are required' });
        return;
      }

      const communities = await container.repositories.communityRepository.findNearby(lat, lng, radius);
      res.json({ status: 'success', data: communities });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/communities
  router.post('/', auth, validate(createCommunitySchema), async (req, res, next) => {
    try {
      const community = await container.useCases.createCommunity.execute(req.body);
      res.status(201).json({ status: 'success', data: community });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/communities/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const community = await container.repositories.communityRepository.findById(req.params.id);
      if (!community) {
        res.status(404).json({ status: 'error', message: 'Community not found' });
        return;
      }
      res.json({ status: 'success', data: community });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/communities/:id/join
  router.post('/:id/join', auth, async (req, res, next) => {
    try {
      const user = await container.useCases.joinCommunity.execute({
        userId: req.user!.userId,
        communityId: req.params.id,
      });
      res.json({ status: 'success', data: { id: user.id, communityId: user.communityId } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
