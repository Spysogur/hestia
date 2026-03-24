import { Router } from 'express';
import { Container } from '../../di/container';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/auth.schema';

export function createAuthRouter(container: Container): Router {
  const router = Router();

  // POST /api/v1/auth/register
  router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
      const user = await container.useCases.registerUser.execute(req.body);
      res.status(201).json({
        status: 'success',
        data: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/auth/login
  router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
      const result = await container.useCases.loginUser.execute(req.body);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
