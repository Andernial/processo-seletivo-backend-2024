import { z } from 'zod';

export const UserValidationSchema = z.object({
  name: z.string().min(4, 'Nome deve conter ao menos 4 caracteres'),
  email: z.string().email({ message: 'Informe um email válido' }),
  password: z
    .string()
    .min(6, 'Senha deve conter pelo menos 6 caracteres')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, 'A senha deve conter pelo menos 1 letra e um número'),
  birthDate: z.string().date('Informe uma data válida'),
});

export type UserInput = z.infer<typeof UserValidationSchema>;
