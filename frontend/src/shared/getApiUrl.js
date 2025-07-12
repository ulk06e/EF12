import { SETTINGS } from 'src/config';

export function getApiUrl(env) {
  const PROD_URL = import.meta.env.VITE_API_URL;
  const LOCAL_URL = 'http://localhost:8000';

  const urls = {
    1: PROD_URL,
    2: LOCAL_URL,
  };

  const selected = urls[env] || PROD_URL;

  if (!selected) {
    throw new Error("🔍 VITE_API_URL:", import.meta.env.DATABASE_URL);
  }

  return selected;
}

export const API_URL = getApiUrl(SETTINGS.API_URL_VERSION);
