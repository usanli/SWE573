import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const MysteryList = ({ searchTerm }) => {
  const [mysteries, setMysteries] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [filter, setFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/posts/`)
      .then(response => {
        const sortedMysteries = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setMysteries(sortedMysteries);
      })
      .catch(error => console.error('Error fetching mysteries:', error));

    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
      setSuccessMessage(logoutMessage);
      localStorage.removeItem('logoutMessage');
    }
  }, []);

  const handleVote = (postId, voteType) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .post(
        `${API_BASE_URL}/posts/${postId}/${voteType}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      )
      .then(response => {
        // Update the state with the new vote counts
        setMysteries(prevMysteries =>
          prevMysteries.map(mystery =>
            mystery.id === postId ? { ...mystery, ...response.data } : mystery
          )
        );
      })
      .catch(error => console.error('Error updating votes:', error));
  };

  const handleLoadMore = () => {
    setVisibleCount(visibleCount + 6);
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
    return matchesSearch;
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
          filteredMysteries.slice(0, visibleCount).map(mystery => (
            <div className="col-md-4 mb-4" key={mystery.id}>
              <div
                className="card h-100 position-relative"
                style={{
                  border: mystery.tags?.some(tag => tag.name === 'Mystery Solved!') ? '4px solid #28a745' : 'none',
                  borderRadius: '10px',
                }}
              >
                {mystery.image && (
                  <div
                    style={{ height: '200px', overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => navigate(`/mystery/${mystery.id}`)}
                  >
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
                    <Link to={`/mystery/${mystery.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {mystery.title}
                    </Link>
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

                {/* Upvote and Downvote Buttons */}
                {isLoggedIn && (
                  <div
                    className="d-flex flex-column align-items-center"
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '10px',
                      zIndex: 10,
                    }}
                  >
                    <span
                      className="text-success"
                      style={{ fontSize: '14px', cursor: 'pointer' }}
                      title="Upvote"
                      onClick={() => handleVote(mystery.id, 'upvote')}
                    >
                      ▲
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        marginTop: '4px',
                        marginBottom: '4px',
                        color: 'var(--primary-text-gray)',
                      }}
                    >
                      {mystery.upvotes - mystery.downvotes}
                    </span>
                    <span
                      className="text-danger"
                      style={{ fontSize: '14px', cursor: 'pointer' }}
                      title="Downvote"
                      onClick={() => handleVote(mystery.id, 'downvote')}
                    >
                      ▼
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center" style={{ color: 'var(--primary-text-gray)' }}>No mysteries found</p>
        )}
      </div>

      {visibleCount < filteredMysteries.length && (
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={handleLoadMore}>
            Load More Mysteries
          </button>
        </div>
      )}
    </div>
  );
};

export default MysteryList;
