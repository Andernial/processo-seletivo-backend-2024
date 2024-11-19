import { z } from 'zod';
// não é o propósito do pull request mas adicionei pequenas validações a mais aqui
export const UserValidationSchema = z.object({
  name: z.string().min(4, 'Nome deve conter ao menos 4 caracteres').max(20, 'Nome deve conter no máximo 20 caracteres'),
  email: z.string().email({ message: 'Informe um email válido' }),
  password: z
    .string()
    .min(6, 'Senha deve conter pelo menos 6 caracteres')
    .max(256, 'Senha deve conter no máximo 256 caracteres')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, 'A senha deve conter pelo menos 1 letra e um número'),
  birthDate: z.string().date('Informe uma data válida seguindo o formato 0000-00-00'),
});

export type UserInput = z.infer<typeof UserValidationSchema>;
