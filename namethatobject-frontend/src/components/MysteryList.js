import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const MysteryList = ({ searchTerm }) => {
  const [mysteries, setMysteries] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6); // Initial count for visible posts
  const [filter, setFilter] = useState('all'); // Filter state: 'all', 'solved', 'unsolved'
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/posts/`)
      .then(response => {
        // Sort the mysteries by date (newest to oldest)
        const sortedMysteries = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setMysteries(sortedMysteries);
      })
      .catch(error => console.error('Error fetching mysteries:', error));

    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
      setSuccessMessage(logoutMessage);
      localStorage.removeItem('logoutMessage');
    }
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(visibleCount + 6); // Load 6 more posts each time
  };

  const filteredMysteries = mysteries.filter(mystery => {
    const matchesSearch = 
      mystery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mystery.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mystery.tags && mystery.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())));

    if (filter === 'solved') {
      return matchesSearch && mystery.tags?.some(tag => tag.name === 'Mystery Solved!');
    }
    if (filter === 'unsolved') {
      return matchesSearch && !mystery.tags?.some(tag => tag.name === 'Mystery Solved!');
    }
    return matchesSearch; // 'all'
  });

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4" style={{ color: 'var(--primary-text-gray)' }}>Mysteries</h1>

      {/* Filter Options */}
      <div className="d-flex justify-content-center mb-4">
        <button 
          className={`btn me-2 ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`btn me-2 ${filter === 'solved' ? 'btn-success' : 'btn-outline-success'}`} 
          onClick={() => setFilter('solved')}
        >
          Solved
        </button>
        <button 
          className={`btn ${filter === 'unsolved' ? 'btn-danger' : 'btn-outline-danger'}`} 
          onClick={() => setFilter('unsolved')}
        >
          Unresolved
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success text-center">
          {successMessage}
        </div>
      )}

      <div className="row">
        {filteredMysteries.length > 0 ? (
          filteredMysteries.slice(0, visibleCount).map(mystery => ( // Limit the number of posts displayed
            <div className="col-md-4 mb-4" key={mystery.id}>
              <Link to={`/mystery/${mystery.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  className="card h-100"
                  style={{
                    border: mystery.tags?.some(tag => tag.name === 'Mystery Solved!') ? '4px solid #28a745' : 'none',
                    borderRadius: '10px',
                  }}
                >
                  {mystery.image && (
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={mystery.image.startsWith('http') ? mystery.image : `${API_BASE_URL}${mystery.image}`} 
                        className="card-img-top"
                        alt={mystery.title} 
                        style={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                  <div className="card-body" style={{ minHeight: '150px' }}>
                    <h5 className="card-title" style={{ color: 'var(--primary-blue)' }}>
                      {mystery.title}
                    </h5>
                    <p className="card-text" style={{ color: 'var(--secondary-text-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mystery.description}
                    </p>

                    {mystery.tags && mystery.tags.length > 0 && (
                      <div className="tags mt-2">
                        {mystery.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="badge me-1"
                            style={{
                              backgroundColor: tag.name === 'Mystery Solved!' ? '#28a745' : '#6c757d',
                              color: '#fff'
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center" style={{ color: 'var(--primary-text-gray)' }}>No mysteries found</p>
        )}
      </div>

      {visibleCount < filteredMysteries.length && ( // Show the button only if there are more posts to load
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={handleLoadMore}>
            See More Mysteries
          </button>
        </div>
      )}
    </div>
  );
};

export default MysteryList;
