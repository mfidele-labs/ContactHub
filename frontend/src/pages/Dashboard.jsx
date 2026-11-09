
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_URL, { apiFetch } from '../api';

function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Retrieve contacts from the backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await apiFetch(`${API_URL}/api/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to retrieve contacts.');
        }

        setContacts(data);

      } catch (error) {
        setErrorMessage(error.message);

      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // 2. Count contacts added within the last 7 days
  const recentContacts = contacts.filter((contact) => {
    const createdDate = new Date(contact.created_at);
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return createdDate >= sevenDaysAgo;
  });

  // 3. Count favorite contacts
  const favoriteContacts = contacts.filter(
    (contact) => contact.is_favorite
  );

  // 4. Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>ContactHub</h1>
          <span>YOUR PERSONAL DIRECTORY</span>
        </div>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/contacts">Contacts</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/signin" onClick={handleLogout}>Sign Out</Link>
        </nav>
      </header>

      <main className="dashboard-content">
        <span className="eyebrow">YOUR PERSONAL SPACE</span>

        <h2>Welcome to your directory.</h2>

        <p>
          Keep your connections organized, accessible,
          and always within reach.
        </p>

        {errorMessage && (
          <p className="error">{errorMessage}</p>
        )}

        <div className="overview-grid">
          <div className="overview-card">
            <span>TOTAL CONTACTS</span>
            <h3>{loading ? '...' : contacts.length}</h3>
            <p>People in your directory</p>
          </div>

          <div className="overview-card">
            <span>RECENTLY ADDED</span>
            <h3>{loading ? '...' : recentContacts.length}</h3>
            <p>Added within the last 7 days</p>
          </div>

          <div className="overview-card">
            <span>FAVORITES</span>
            <h3>{loading ? '...' : favoriteContacts.length}</h3>
            <p>Your important connections</p>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/contacts" className="primary-action">
            + VIEW MY CONTACTS
          </Link>

          <Link to="/contacts" className="secondary-action">
            EXPLORE YOUR DIRECTORY →
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
