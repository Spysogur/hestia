import { Router } from 'express';

export const helpRouter = Router();

// POST /api/v1/help/requests
helpRouter.post('/requests', async (req, res, next) => {
  try {
    // TODO: wire up CreateHelpRequest use case
    res.status(201).json({ message: 'Help request created', data: req.body });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/help/requests/emergency/:emergencyId
helpRouter.get('/requests/emergency/:emergencyId', async (req, res, next) => {
  try {
    // TODO: wire up use case
    res.json({ message: 'Help requests for emergency', emergencyId: req.params.emergencyId, data: [] });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/help/offers
helpRouter.post('/offers', async (req, res, next) => {
  try {
    // TODO: wire up CreateHelpOffer use case
    res.status(201).json({ message: 'Help offer created', data: req.body });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/help/offers/emergency/:emergencyId
helpRouter.get('/offers/emergency/:emergencyId', async (req, res, next) => {
  try {
    // TODO: wire up use case
    res.json({ message: 'Help offers for emergency', emergencyId: req.params.emergencyId, data: [] });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/help/match/:requestId/:offerId
helpRouter.post('/match/:requestId/:offerId', async (req, res, next) => {
  try {
    // TODO: wire up MatchHelpRequest use case
    res.json({
      message: 'Matched',
      requestId: req.params.requestId,
      offerId: req.params.offerId,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/help/auto-match/:emergencyId
helpRouter.post('/auto-match/:emergencyId', async (_req, res, next) => {
  try {
    // TODO: wire up AutoMatch use case
    res.json({ message: 'Auto-matching complete', matches: [] });
  } catch (error) {
    next(error);
  }
});
