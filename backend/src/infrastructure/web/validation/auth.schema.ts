import { z } from 'zod';
import { VulnerabilityType } from '../../../domain/entities/User';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string().min(7, 'Phone number is required'),
    skills: z.array(z.string()).optional(),
    vulnerabilities: z.array(z.nativeEnum(VulnerabilityType)).optional(),
    resources: z.array(z.string()).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});
