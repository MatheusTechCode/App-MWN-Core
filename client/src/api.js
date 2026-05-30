const localHosts = ['localhost', '127.0.0.1'];
const isLocalVite = localHosts.includes(window.location.hostname) && window.location.port.startsWith('517');
const defaultApiUrl = isLocalVite
  ? `${window.location.protocol}//${window.location.hostname}:3001/api`
  : `${window.location.origin}/api`;

const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

export async function api(path, options = {}) {
  const token = localStorage.getItem('comandax_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Falha ao comunicar com o servidor.');
  }

  return data;
}
