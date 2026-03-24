import { z } from 'zod';
import { EmergencyType, EmergencySeverity } from '../../../domain/entities/Emergency';

export const activateEmergencySchema = z.object({
  body: z.object({
    communityId: z.string().uuid(),
    type: z.nativeEnum(EmergencyType),
    severity: z.nativeEnum(EmergencySeverity),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusKm: z.number().positive('Radius must be positive'),
  }),
});

export const resolveEmergencySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
