import { z } from 'zod';

export const UserValidationSchema = z.object({
  name: z.string(),
  email: z.string().email({ message: 'Usuário deve informar um email válido' }),
  password: z.string().min(6),
  birthDate: z.string().date(),
});
