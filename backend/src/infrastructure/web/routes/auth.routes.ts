import { Router } from 'express';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    // TODO: wire up RegisterUser use case
    res.status(201).json({ message: 'User registered', data: req.body });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    // TODO: wire up login use case
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
});
