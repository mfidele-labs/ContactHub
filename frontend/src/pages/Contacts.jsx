
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_URL, { apiFetch } from '../api';

function Contacts() {
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Retrieve contacts from PostgreSQL
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

  // 2. Add or update a contact
  const handleSaveContact = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await apiFetch(
        `${API_URL}/api/contacts${editingId ? `/${editingId}` : ''}`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save contact.');
      }

      if (editingId) {
        setContacts((previousContacts) =>
          previousContacts.map((contact) =>
            contact.id === editingId ? data : contact
          )
        );

        setSuccessMessage('Contact updated successfully!');
      } else {
        setContacts((previousContacts) => [data, ...previousContacts]);

        setSuccessMessage('Contact added successfully!');
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });

      setEditingId(null);
      setShowForm(false);

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 3. Delete a contact
  const handleDeleteContact = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this contact?'
    );

    if (!confirmed) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await apiFetch(`${API_URL}/api/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete contact.');
      }

      setContacts((previousContacts) =>
        previousContacts.filter((contact) => contact.id !== id)
      );

      setSuccessMessage('Contact deleted successfully!');

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 4. Toggle favorite status
  const handleToggleFavorite = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await apiFetch(
        `${API_URL}/api/contacts/${id}/favorite`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update favorite.');
      }

      setContacts((previousContacts) =>
        previousContacts.map((contact) =>
          contact.id === id ? data : contact
        )
      );

      setSuccessMessage(
        data.is_favorite
          ? 'Contact added to favorites!'
          : 'Contact removed from favorites!'
      );

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 5. Edit a contact
  const handleEditContact = (contact) => {
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || ''
    });

    setEditingId(contact.id);
    setShowForm(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // 6. Cancel the form
  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    });

    setEditingId(null);
    setShowForm(false);
  };

  // 7. Search and filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      `${contact.name} ${contact.email || ''} ${contact.phone || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFavorite =
      !showFavoritesOnly || contact.is_favorite;

    return matchesSearch && matchesFavorite;
  });

  // 8. Logout
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
        <span className="eyebrow">YOUR COLLECTION</span>

        <h2>Every connection, in one place.</h2>

        <p>
          Your personal directory brings all your
          important connections together.
        </p>

        <div className="contacts-toolbar">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setSearchQuery(searchTerm.trim())}
          >
            SEARCH
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSearchQuery('');
            }}
          >
            CLEAR
          </button>

          <button
            type="button"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? 'SHOW ALL CONTACTS' : 'SHOW FAVORITES'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: '',
                email: '',
                phone: '',
                address: ''
              });
            }}
          >
            + ADD NEW CONTACT
          </button>
        </div>

        {errorMessage && (
          <p className="error">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="success">{successMessage}</p>
        )}

        {showForm && (
          <div className="contact-form">
            <h3>
              {editingId ? 'Edit Connection' : 'New Connection'}
            </h3>

            <form onSubmit={handleSaveContact}>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <button type="submit">
                {editingId ? 'UPDATE CONTACT' : 'SAVE CONTACT'}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                CANCEL
              </button>
            </form>
          </div>
        )}

        <section className="contacts-list">
          <h3>
            {showFavoritesOnly ? 'Your Favorites' : 'Your Directory'}
            {' '}({filteredContacts.length})
          </h3>

          {loading ? (
            <p>Loading your contacts...</p>
          ) : filteredContacts.length === 0 ? (
            <p>
              {showFavoritesOnly && contacts.length > 0
                ? 'You have no favorite contacts yet. Add some using the star button!'
                : contacts.length === 0
                  ? 'No contacts yet. Start building your directory!'
                  : 'No contacts match your search.'}
            </p>
          ) : (
            <div className="contact-grid">
              {filteredContacts.map((contact) => (
                <article className="contact-card" key={contact.id}>
                  <div className="contact-details">
                    <h4>{contact.name}</h4>
                    <p>{contact.email}</p>
                    <p>{contact.phone}</p>
                    <p>{contact.address}</p>
                  </div>

                  <div className="contact-actions">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(contact.id)}
                    >
                      {contact.is_favorite
                        ? '★ FAVORITE'
                        : '☆ ADD TO FAVORITES'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditContact(contact)}
                    >
                      EDIT
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      DELETE
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Contacts;
