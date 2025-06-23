import { SETTINGS } from '../config';

export * from './projects';
export * from './items';

export function getApiUrl(env) {
    const urls = {
      1: 'http://ulk06e-ef12-0b57.twc1.net',   // прод
      2: 'http://localhost:8000',       // локально
    };
    return urls[env] || urls[1]; // по умолчанию — прод
  }
  
  export const API_URL = getApiUrl(SETTINGS.API_URL_VERSION); // ← поменяй 1 или 2 здесь

  