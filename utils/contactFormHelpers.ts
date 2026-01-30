export const executeRecaptchaWithTimeout = async (
  executeRecaptcha: ((action: string) => Promise<string>) | undefined,
  action: string,
) => {
  if (!executeRecaptcha) throw new Error('RECAPTCHA_NOT_READY');
  return Promise.race([
    executeRecaptcha(action),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('RECAPTCHA_TIMEOUT')), 8000),
    ),
  ]);
};

export const isLocalhost = () => window.location.hostname === 'localhost';
