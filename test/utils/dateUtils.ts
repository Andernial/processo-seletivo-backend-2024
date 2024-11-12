const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false, // Se você quer usar o formato de 12 horas (AM/PM)
  timeZone: 'UTC',
};

export const formatTokenDate = (exp: number) => {
  const expirationDate = new Date(exp * 1000);
  const tokenExpirationDate = new Intl.DateTimeFormat('pt-BR', options).format(expirationDate);

  return tokenExpirationDate;
};

export const returnFutureDates = () => {
  const rememberMeTrue = new Date();
  rememberMeTrue.setHours(rememberMeTrue.getHours() + 168);
  const rememberMeFalse = new Date();
  rememberMeFalse.setHours(rememberMeFalse.getHours() + 8);
  const formattedDateTrue = new Intl.DateTimeFormat('pt-BR', options).format(rememberMeTrue);
  const formattedDateFalse = new Intl.DateTimeFormat('pt-BR', options).format(rememberMeFalse);

  return { formattedDateTrue, formattedDateFalse };
};
