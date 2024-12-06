import jwt from 'jsonwebtoken';

export function generateToken(userId: number, remindMe: boolean) {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY ?? '', { expiresIn: remindMe ? '168h' : '8h' });
}
