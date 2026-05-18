import { z }  from 'zod';

// Skema validasi register
export const registerUserSchema = z.object({
    name: z.string().min(3, 'Name is required (min 3 chars)'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 6 charactest long'),
});

// Skema validasi login
export const loginUserSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;