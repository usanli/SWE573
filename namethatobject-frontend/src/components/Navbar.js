// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import logo from '../assets/images/logo.png';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        setUsername(userData.username);
      }
    }
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location.pathname]);

  useEffect(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, [location.pathname]);

  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/`);
        const filteredResults = response.data.filter(post =>
          post.title.toLowerCase().includes(term.toLowerCase()) ||
          post.description.toLowerCase().includes(term.toLowerCase()) ||
          (post.tags && post.tags.some(tag => tag.name.toLowerCase().includes(term.toLowerCase())))
        );
        setSearchResults(filteredResults.slice(0, 5));
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?query=${searchTerm}`);
    setSearchResults([]);
  };

  const handleSelectResult = (id) => {
    navigate(`/mystery/${id}`);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.setItem('logoutMessage', 'You have successfully logged out.');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ backgroundColor: 'white' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="NameThatObject Logo" style={{ height: '40px' }} />
        </Link>

        <div className="d-flex align-items-center">
          <form className="form-inline me-3 position-relative" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="form-control"
              placeholder="Search mysteries..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ 
                width: '250px',
                borderRadius: '20px',
                paddingLeft: '15px'
              }}
            />
            {searchResults.length > 0 && (
              <ul
                className="list-group position-absolute bg-white shadow"
                style={{ top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
              >
                {searchResults.map(result => (
                  <li
                    key={result.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSelectResult(result.id)}
                    style={{ cursor: 'pointer', color: 'var(--primary-text-gray)' }}
                  >
                    {result.title}
                  </li>
                ))}
              </ul>
            )}
          </form>

          <div className="d-flex align-items-center">
            {isLoggedIn && (
              <Link
                className="btn btn-primary me-3"
                to="/post-mystery"
                style={{ 
                  borderRadius: '20px',
                  padding: '8px 20px'
                }}
              >
                Post a Mystery
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <Link 
                  className="nav-link me-3" 
                  to={`/profile/${username}`}
                  style={{ color: 'var(--primary-text-gray)' }}
                >
                  {username}
                </Link>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleLogout}
                  style={{ borderRadius: '20px' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  className="btn btn-outline-primary me-2" 
                  to="/signup"
                  style={{ borderRadius: '20px' }}
                >
                  Sign Up
                </Link>
                <Link 
                  className="btn btn-primary" 
                  to="/signin"
                  style={{ borderRadius: '20px' }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
