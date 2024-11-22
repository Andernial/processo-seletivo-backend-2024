import { z } from 'zod';

export const UserValidationSchema = z.object({
  name: z.string().min(4, 'Nome deve conter ao menos 4 caracteres').max(70, 'Nome deve conter no máximo 70 caracteres'),
  email: z.string().email({ message: 'Informe um email válido' }),
  password: z
    .string()
    .min(6, 'Senha deve conter pelo menos 6 caracteres')
    .max(256, 'Senha deve conter no máximo 256 caracteres')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, 'A senha deve conter pelo menos 1 letra e um número'),
  birthDate: z.string().date('Informe uma data válida seguindo o formato 0000-00-00'),
});

export type UserInput = z.infer<typeof UserValidationSchema>;
