
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../api';
import API_URL from '../api';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!token) {
      setStatus('unauthorized');
      return;
    }

    let active = true;

    const verifyToken = async () => {
      try {
        const response = await apiFetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Unable to verify your session.');
        }

        if (active) {
          setStatus('authorized');
        }

      } catch (error) {
        if (active) {
          setStatus('error');
        }
      }
    };

    verifyToken();

    return () => {
      active = false;
    };
  }, [token]);

  if (status === 'unauthorized') {
    return <Navigate to="/signin" replace />;
  }

  if (status === 'checking') {
    return <p>Verifying your session...</p>;
  }

  if (status === 'error') {
    return <p>Unable to verify your session. Please refresh the page.</p>;
  }

  return children;
}

export default ProtectedRoute;
