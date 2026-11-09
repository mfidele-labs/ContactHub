
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  // Retrieve the signed-in user's information
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/signin');
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        <Link to="/dashboard" className="back-home">
          ← BACK TO DASHBOARD
        </Link>

        <span className="eyebrow">YOUR ACCOUNT</span>

        <h1>Personal Profile</h1>

        <p>Your ContactHub account information.</p>

        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
        </div>

        <div className="profile-details">
          <div>
            <label>FULL NAME</label>
            <h3>{user?.name || 'Name unavailable'}</h3>
          </div>

          <div>
            <label>EMAIL ADDRESS</label>
            <h3>{user?.email || 'Email unavailable'}</h3>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/contacts">
            VIEW MY CONTACTS
          </Link>

          <button onClick={handleLogout}>
            SIGN OUT
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;
