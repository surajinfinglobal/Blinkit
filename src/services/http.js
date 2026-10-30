const API_URL = 'http://localhost:5000/api';

function handleUnauthorized() {
  // Clear token and redirect to login/phone
  try {
    localStorage.removeItem('token');
  } catch (e) {
    // ignore
  }
  // Avoid redirect loops
  if (typeof window !== 'undefined') {
    const current = window.location.pathname;
    if (current !== '/login' && current !== '/phone' && current !== '/' && current !== '/Welcome') {
      window.location.href = '/phone';
    }
  }
}

export async function httpRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    handleUnauthorized();
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Session expired. Please login again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export async function httpGet(path, options = {}) {
  return httpRequest(path, { ...options, method: 'GET' });
}

export async function httpPost(path, body, options = {}) {
  return httpRequest(path, { ...options, method: 'POST', body: JSON.stringify(body) });
}

export async function httpPatch(path, body, options = {}) {
  return httpRequest(path, { ...options, method: 'PATCH', body: JSON.stringify(body) });
}

export async function httpDelete(path, options = {}) {
  return httpRequest(path, { ...options, method: 'DELETE' });
}
