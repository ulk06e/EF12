import { SETTINGS } from 'src/config';

export function getApiUrl(env) {
    const urls = {
      1: import.meta.env.VITE_API_URL,
      2: 'http://localhost:8000',
    };
    return urls[env] || urls[1]; // по умолчанию — прод
  }
  
  export const API_URL = getApiUrl(SETTINGS.API_URL_VERSION); // ← поменяй 1 или 2 здесь

  