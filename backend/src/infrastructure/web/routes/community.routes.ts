import { Router } from 'express';

export const communityRouter = Router();

// GET /api/v1/communities
communityRouter.get('/', async (_req, res, next) => {
  try {
    // TODO: wire up use case
    res.json({ message: 'List communities', data: [] });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/communities
communityRouter.post('/', async (req, res, next) => {
  try {
    // TODO: wire up CreateCommunity use case
    res.status(201).json({ message: 'Community created', data: req.body });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/communities/:id
communityRouter.get('/:id', async (req, res, next) => {
  try {
    // TODO: wire up use case
    res.json({ message: 'Get community', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/communities/:id/join
communityRouter.post('/:id/join', async (req, res, next) => {
  try {
    // TODO: wire up JoinCommunity use case
    res.json({ message: 'Joined community', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/communities/nearby?lat=X&lng=Y&radius=Z
communityRouter.get('/nearby', async (req, res, next) => {
  try {
    // TODO: wire up use case
    res.json({ message: 'Nearby communities', data: [] });
  } catch (error) {
    next(error);
  }
});
