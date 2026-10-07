const API_BASE = '/api/opportunities';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch (networkError) {
    const error = new Error('Cannot reach the server. Is the backend running?');
    error.details = [];
    error.status = 0;
    throw error;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error(
      (data && data.error) || `Request failed with status ${response.status}`
    );
    error.details = (data && data.details) || [];
    error.status = response.status;
    throw error;
  }

  return data;
}

function jsonOptions(method, data) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

const OpportunityAPI = {
  getAll() {
    return request(API_BASE);
  },
  getOne(id) {
    return request(`${API_BASE}/${encodeURIComponent(id)}`);
  },
  create(data) {
    return request(API_BASE, jsonOptions('POST', data));
  },
  update(id, data) {
    return request(`${API_BASE}/${encodeURIComponent(id)}`, jsonOptions('PUT', data));
  },
  remove(id) {
    return request(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
