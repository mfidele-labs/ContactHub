
import { useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to process your request.');
      }

      setMessage(data.message);
      setEmail('');

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

        <h1>Forgot your password?</h1>

        <p>
          Enter your registered email address and we'll send
          you a link to reset your password.
        </p>

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
          <label>Email Address</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>

        <p>
          Remember your password? <Link to="/signin">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;
