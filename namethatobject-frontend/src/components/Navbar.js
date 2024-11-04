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

  // Clear search term and results on page change
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
          post.description.toLowerCase().includes(term.toLowerCase())
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
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: 'var(--background-gray)' }}>
      <div className="container">
        <Link className="navbar-brand" to="/" style={{ color: 'var(--primary-text-gray)' }}>
          <img src={logo} alt="NameThatObject Logo" style={{ height: '40px' }} />
        </Link>

        <div className="collapse navbar-collapse justify-content-end">
          <div className="navbar-nav">
            {isLoggedIn && (
              <Link
                className="nav-link btn btn-primary text-white me-2"
                to="/post-mystery"
                style={{ backgroundColor: 'var(--primary-blue)' }}
              >
                Post a Mystery
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <Link className="nav-link" to="/profile" style={{ color: 'var(--primary-text-gray)' }}>
                  {username}
                </Link>
                <button className="nav-link btn btn-link" style={{ color: 'var(--primary-text-gray)' }} onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/signup" style={{ color: 'var(--primary-text-gray)' }}>Sign Up</Link>
                <Link className="nav-link" to="/signin" style={{ color: 'var(--primary-text-gray)' }}>Sign In</Link>
              </>
            )}
          </div>

          <form className="form-inline my-2 my-lg-0 position-relative" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="form-control"
              placeholder="Search mysteries..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: '250px', borderColor: 'var(--primary-blue)' }}
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
