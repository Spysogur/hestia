import { Router } from 'express';
import { Container } from '../../di/container';
import { createAuthMiddleware } from '../../auth/authMiddleware';
import { validate } from '../middleware/validate';
import { activateEmergencySchema, resolveEmergencySchema } from '../validation/emergency.schema';

export function createEmergencyRouter(container: Container): Router {
  const router = Router();
  const auth = createAuthMiddleware(container.jwtService);

  // GET /api/v1/emergencies/active
  router.get('/active', async (req, res, next) => {
    try {
      const communityId = req.query.communityId as string | undefined;
      const emergencies = await container.useCases.getActiveEmergencies.execute({ communityId });
      res.json({ status: 'success', data: emergencies });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/emergencies/activate
  router.post('/activate', auth, validate(activateEmergencySchema), async (req, res, next) => {
    try {
      const emergency = await container.useCases.activateEmergency.execute({
        ...req.body,
        activatedBy: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: emergency });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/emergencies/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const emergency = await container.repositories.emergencyRepository.findById(req.params.id);
      if (!emergency) {
        res.status(404).json({ status: 'error', message: 'Emergency not found' });
        return;
      }
      res.json({ status: 'success', data: emergency });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/v1/emergencies/:id/resolve
  router.put('/:id/resolve', auth, validate(resolveEmergencySchema), async (req, res, next) => {
    try {
      const emergency = await container.useCases.resolveEmergency.execute({
        emergencyId: req.params.id,
        resolvedBy: req.user!.userId,
      });
      res.json({ status: 'success', data: emergency });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/v1/emergencies/:id/escalate
  router.put('/:id/escalate', auth, async (req, res, next) => {
    try {
      const emergency = await container.repositories.emergencyRepository.findById(req.params.id);
      if (!emergency) {
        res.status(404).json({ status: 'error', message: 'Emergency not found' });
        return;
      }
      emergency.escalate();
      const updated = await container.repositories.emergencyRepository.update(emergency);
      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
