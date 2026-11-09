
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API_URL from '../api';

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sessionExpired =
    new URLSearchParams(location.search).get('reason') === 'session-expired';

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');

    } catch (error) {
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="back-home">
          ← BACK TO HOMEPAGE
        </Link>

        <span className="eyebrow">WELCOME BACK</span>

        <h1>Good to see you.</h1>

        <p>Sign in to access your personal directory.</p>

      {sessionExpired && (
        <div className="session-expired-message">
          <strong>SESSION EXPIRED</strong>
          <p>Your session has expired. Please sign in again to continue.</p>
        </div>
      )}
        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="forgot-password-link">
            <Link to="/forgot-password">
              Forgot your password?
            </Link>
          </div>

          {message && (
            <p className="error">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p>
          New to ContactHub? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
