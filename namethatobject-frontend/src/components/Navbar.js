// src/components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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
    if (searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearchClick = (post) => {
    setShowDropdown(false);
    navigate(`/mystery/${post.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/logout-success');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ backgroundColor: 'white' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="NameThatObject Logo" style={{ height: '40px' }} />
        </Link>

        <div className="d-flex align-items-center">
          <form className="form-inline me-3 position-relative" onSubmit={handleSearchSubmit}>
            <div className="position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Search mysteries..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                style={{ 
                  width: '250px',
                  borderRadius: '20px',
                  paddingLeft: '15px'
                }}
              />
              {showDropdown && searchResults.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="position-absolute w-100 mt-1 bg-white rounded shadow-sm"
                  style={{ 
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  {searchResults.map(result => (
                    <div
                      key={result.id}
                      className="d-flex align-items-center p-2 border-bottom hover-bg-light"
                      onClick={() => handleSearchClick(result)}
                      style={{ 
                        cursor: 'pointer', 
                        color: 'var(--primary-text-gray)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div className="text-truncate">
                        {result.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
