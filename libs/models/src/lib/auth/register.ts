import { z } from 'zod';

export const RegisterRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string().min(3),
});

export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const RegisterResponse = z.object({
  type: z.literal('Success'),
});

export type RegisterResponse = z.infer<typeof RegisterResponse>;
