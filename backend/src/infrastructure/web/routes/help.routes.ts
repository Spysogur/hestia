import { Router } from 'express';
import { Container } from '../../di/container';
import { createAuthMiddleware } from '../../auth/authMiddleware';
import { validate } from '../middleware/validate';
import { createHelpRequestSchema, createHelpOfferSchema } from '../validation/help.schema';

export function createHelpRouter(container: Container): Router {
  const router = Router();
  const auth = createAuthMiddleware(container.jwtService);

  // POST /api/v1/help/requests
  router.post('/requests', auth, validate(createHelpRequestSchema), async (req, res, next) => {
    try {
      const result = await container.useCases.createHelpRequest.execute({
        ...req.body,
        requesterId: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/help/requests/emergency/:emergencyId
  router.get('/requests/emergency/:emergencyId', auth, async (req, res, next) => {
    try {
      const requests = await container.repositories.helpRequestRepository.findByEmergency(
        req.params.emergencyId
      );
      res.json({ status: 'success', data: requests });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/help/offers
  router.post('/offers', auth, validate(createHelpOfferSchema), async (req, res, next) => {
    try {
      const offer = await container.useCases.createHelpOffer.execute({
        ...req.body,
        volunteerId: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: offer });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/help/offers/emergency/:emergencyId
  router.get('/offers/emergency/:emergencyId', auth, async (req, res, next) => {
    try {
      const offers = await container.repositories.helpOfferRepository.findByEmergency(
        req.params.emergencyId
      );
      res.json({ status: 'success', data: offers });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/help/match/:requestId/:offerId
  router.post('/match/:requestId/:offerId', auth, async (req, res, next) => {
    try {
      const { requestId, offerId } = req.params;

      const request = await container.repositories.helpRequestRepository.findById(requestId);
      if (!request) {
        res.status(404).json({ status: 'error', message: 'Help request not found' });
        return;
      }

      const offer = await container.repositories.helpOfferRepository.findById(offerId);
      if (!offer) {
        res.status(404).json({ status: 'error', message: 'Help offer not found' });
        return;
      }

      request.matchVolunteer(offer.volunteerId);
      offer.matchToRequest(requestId);

      const [updatedRequest, updatedOffer] = await Promise.all([
        container.repositories.helpRequestRepository.update(request),
        container.repositories.helpOfferRepository.update(offer),
      ]);

      res.json({ status: 'success', data: { request: updatedRequest, offer: updatedOffer } });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/help/auto-match/:emergencyId
  router.post('/auto-match/:emergencyId', auth, async (req, res, next) => {
    try {
      const { emergencyId } = req.params;
      const openRequests = await container.repositories.helpRequestRepository.findOpenByEmergency(emergencyId);
      const availableOffers = await container.repositories.helpOfferRepository.findAvailableByEmergency(emergencyId);

      const matches: Array<{ requestId: string; offerId: string }> = [];

      for (const request of openRequests) {
        const compatible = availableOffers.filter(
          (o) => o.type === request.type && o.isAvailable()
        );
        if (compatible.length > 0) {
          const offer = compatible[0];
          request.matchVolunteer(offer.volunteerId);
          offer.matchToRequest(request.id);
          await Promise.all([
            container.repositories.helpRequestRepository.update(request),
            container.repositories.helpOfferRepository.update(offer),
          ]);
          matches.push({ requestId: request.id, offerId: offer.id });
          // Remove used offer from further matching
          availableOffers.splice(availableOffers.indexOf(offer), 1);
        }
      }

      res.json({ status: 'success', data: { matches } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
