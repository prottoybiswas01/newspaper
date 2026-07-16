const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  
  post: async (endpoint, body) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return res.json();
  },
  
  put: async (endpoint, body) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return res.json();
  },
  
  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
  
  // Custom multi-part file upload helper
  upload: async (endpoint, formData) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    return res.json();
  }
};
