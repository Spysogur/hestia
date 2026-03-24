import { z } from 'zod';

export const createCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusKm: z.number().positive('Radius must be positive'),
    country: z.string().min(2),
    region: z.string().min(2),
  }),
});

export const nearbyQuerySchema = z.object({
  query: z.object({
    lat: z.string().transform(Number),
    lng: z.string().transform(Number),
    radius: z.string().transform(Number).optional(),
  }),
});
