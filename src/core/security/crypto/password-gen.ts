export function generatePassword(
  length: number = 12,
  includeLowercase: boolean = true,
  includeUppercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true,
) {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=';

  let allowedChars = '';
  let password = '';

  allowedChars += includeLowercase ? lowercaseChars : '';
  allowedChars += includeUppercase ? uppercaseChars : '';
  allowedChars += includeNumbers ? numberChars : '';
  allowedChars += includeSymbols ? symbolChars : '';

  if (length <= 0) {
    length = 12;
  }
  if (allowedChars.length === 0) {
    allowedChars += lowercaseChars;
  }

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allowedChars.length);
    password += allowedChars[randomIndex];
  }

  return password;
}
