import { z } from 'zod';
import { UserSchema } from '../prisma';

export const PublicUser = UserSchema.omit({
  createdAt: true,
  email: true,
  updatedAt: true,
  password: true,
});

export type PublicUser = z.infer<typeof PublicUser>;
