export const getGoogleAuthUrl = (): string | undefined => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URIS || '';
  if (!clientId) return undefined;
  const url = `https://accounts.google.com/o/oauth2/v2/auth`;
  const query = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'consent',
    access_type: 'offline',
  };
  return `${url}?${new URLSearchParams(query).toString()}`;
};
