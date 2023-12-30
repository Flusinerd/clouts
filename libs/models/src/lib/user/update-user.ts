import { z } from 'zod';
import { UserSchema } from '../prisma';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const UpdateUserRequest = UserSchema.partial()
  .pick({
    bio: true,
    location: true,
    firstName: true,
    lastName: true,
    displayName: true,
  })
  .extend({
    profilePicture: z
      .any()
      .optional()
      .refine((files) => files?.length === 1)
      .refine(
        (files) => files?.[0].size <= MAX_FILE_SIZE,
        'Max file size is 5MB',
      )
      .refine((files) => ACCEPTED_MIME_TYPES.includes(files?.[0].mimetype), {
        message: 'Only jpeg, jpg, png and webp files are allowed',
      }),
    bannerPicture: z
      .any()
      .optional()
      .refine((files) => files?.length === 1)
      .refine(
        (files) => files?.[0].size <= MAX_FILE_SIZE,
        'Max file size is 10MB',
      )
      .refine((files) => ACCEPTED_MIME_TYPES.includes(files?.[0].mimetype), {
        message: 'Only jpeg, jpg, png and webp files are allowed',
      }),
  });

export type UpdateUserRequest = typeof UpdateUserRequest._type;
