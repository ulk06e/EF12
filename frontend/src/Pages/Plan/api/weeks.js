import { API_URL } from 'src/config/api';

export async function fetchItems() {
  const res = await fetch(`${API_URL}/items`);
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
} 