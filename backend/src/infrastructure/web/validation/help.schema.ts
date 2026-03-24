import { z } from 'zod';
import { HelpRequestType, HelpRequestPriority } from '../../../domain/entities/HelpRequest';

export const createHelpRequestSchema = z.object({
  body: z.object({
    emergencyId: z.string().uuid(),
    type: z.nativeEnum(HelpRequestType),
    priority: z.nativeEnum(HelpRequestPriority),
    title: z.string().min(3),
    description: z.string().min(10),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    numberOfPeople: z.number().int().positive(),
  }),
});

export const createHelpOfferSchema = z.object({
  body: z.object({
    emergencyId: z.string().uuid(),
    type: z.nativeEnum(HelpRequestType),
    description: z.string().min(10),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    capacity: z.number().int().positive().optional(),
  }),
});
