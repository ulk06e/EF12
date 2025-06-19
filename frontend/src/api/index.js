export * from './projects';
export * from './items';

export function getApiUrl(env) {
    const urls = {
      1: 'https://ef12.onrender.com',   // прод
      2: 'http://localhost:8000',       // локально
    };
    return urls[env] || urls[1]; // по умолчанию — прод
  }
  
  export const API_URL = getApiUrl(1); // ← поменяй 1 или 2 здесь

  