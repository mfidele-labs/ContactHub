
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API_URL from '../api';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!token) {
      setError('This password-reset link is invalid or missing.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed.');
      }

      setMessage(data.message);

      setTimeout(() => {
        navigate('/signin');
      }, 2500);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <Link to="/signin" className="back-home">
          ← BACK TO SIGN IN
        </Link>

        <span className="eyebrow">ACCOUNT RECOVERY</span>

        <h1>Create a new password.</h1>

        <p>Choose a new password for your ContactHub account.</p>

        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>New Password</label>

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
          />

          <label>Confirm New Password</label>

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
          />

          <button type="submit" disabled={loading || !!message}>
            {loading ? 'RESETTING...' : 'RESET PASSWORD'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default ResetPassword;
