import { API_URL } from 'src/shared/getApiUrl';
import { toLocalDateString } from 'src/Pages/Plan/utils/time';

export async function fetchSettings() {
  const res = await fetch(`${API_URL}/settings/default`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data) {
  const res = await fetch(`${API_URL}/settings/default`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
} 