import { SETTINGS } from 'src/config';

export function getApiUrl(env) {
  const PROD_URL = import.meta.env.VITE_API_URL_N;
  const LOCAL_URL = 'http://localhost:8000';

  const urls = {
    1: PROD_URL,
    2: LOCAL_URL,
  };

  const selected = urls[env] || PROD_URL;

  if (!selected) {
    throw new Error('API URL is not defined. Check VITE_API_URL_N in env and SETTINGS.API_URL_VERSION');
  }
  console.log("🔍 VITE_API_URL:", import.meta.env.VITE_API_URL_N);

  return selected;
}

export const API_URL = getApiUrl(SETTINGS.API_URL_VERSION);
