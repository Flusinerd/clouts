import { UserSchema } from '../prisma';

export const UpdateUserRequest = UserSchema.partial().pick({
  bio: true,
  location: true,
  firstName: true,
  lastName: true,
  displayName: true,
});

export type UpdateUserRequest = typeof UpdateUserRequest._type;
