import { SETTINGS } from 'src/config';

export function getApiUrl(env) {
    const urls = {
      1: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    };
    return urls[env] || urls[1]; 
  }
  
  export const API_URL = getApiUrl(SETTINGS.API_URL_VERSION); 

  