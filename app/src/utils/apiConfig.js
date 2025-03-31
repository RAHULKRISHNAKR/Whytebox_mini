const API_URL = import.meta.env.VITE_API_URL || '';

export default {
  getApiUrl: (endpoint) => {
    // If the endpoint already starts with '/', remove it
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${API_URL}/${cleanEndpoint}`;
  }
};
