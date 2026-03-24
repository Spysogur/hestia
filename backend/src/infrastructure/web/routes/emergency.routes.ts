import { Router } from 'express';

export const emergencyRouter = Router();

// GET /api/v1/emergencies/active
emergencyRouter.get('/active', async (_req, res, next) => {
  try {
    // TODO: wire up use case
    res.json({ message: 'Active emergencies', data: [] });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/emergencies/activate
emergencyRouter.post('/activate', async (req, res, next) => {
  try {
    // TODO: wire up ActivateEmergency use case
    res.status(201).json({ message: 'Emergency activated', data: req.body });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/emergencies/:id
emergencyRouter.get('/:id', async (req, res, next) => {
  try {
    // TODO: wire up use case
    res.json({ message: 'Get emergency', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/emergencies/:id/resolve
emergencyRouter.put('/:id/resolve', async (req, res, next) => {
  try {
    // TODO: wire up ResolveEmergency use case
    res.json({ message: 'Emergency resolved', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/emergencies/:id/escalate
emergencyRouter.put('/:id/escalate', async (req, res, next) => {
  try {
    // TODO: wire up EscalateEmergency use case
    res.json({ message: 'Emergency escalated', id: req.params.id });
  } catch (error) {
    next(error);
  }
});
