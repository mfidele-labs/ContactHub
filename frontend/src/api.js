
const API_URL = import.meta.env.VITE_API_URL;

// Reusable function for API requests
export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);

  // Check whether the session has expired
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.location.replace('/signin?reason=session-expired');

    throw new Error('Your session has expired. Please sign in again.');
  }

  return response;
}

export default API_URL;
