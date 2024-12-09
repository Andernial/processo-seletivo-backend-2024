const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=';

interface PasswordOptions {
  length?: number;
  includeLowercase?: boolean;
  includeUppercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

export function generatePassword({
  length = 12,
  includeLowercase = true,
  includeUppercase = true,
  includeNumbers = true,
  includeSymbols = true,
}: PasswordOptions): string {
  let allowedChars = '';
  let counter = length;
  allowedChars += includeLowercase ? lowercaseChars : '';
  allowedChars += includeUppercase ? uppercaseChars : '';
  allowedChars += includeNumbers ? numberChars : '';
  allowedChars += includeSymbols ? symbolChars : '';

  if (length <= 0) {
    counter = 12;
  }

  if (allowedChars.length === 0) {
    allowedChars += lowercaseChars;
  }

  const randomPassword: string = Array(counter)
    .fill(null)
    .reduce((previous) => {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      return previous + allowedChars[randomIndex];
    }, '');

  return randomPassword;
}
