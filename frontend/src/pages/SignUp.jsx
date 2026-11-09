import { useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../api';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setMessage('Account created successfully! You can now sign in.');
      setMessageType('success');

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

    } catch (error) {
      setMessage(error.message);
      setMessageType('error');

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

        <span className="eyebrow">JOIN THE DIRECTORY</span>

        <h1>Create your account.</h1>

        <p>Start keeping your connections beautifully organized.</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {message && (
            <p className={messageType}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;