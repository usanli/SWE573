// src/components/MysteryList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const MysteryList = ({ searchTerm }) => {
  const [mysteries, setMysteries] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/posts/`)
      .then(response => setMysteries(response.data))
      .catch(error => console.error('Error fetching mysteries:', error));
  }, []);

  const filteredMysteries = mysteries.filter(mystery =>
    mystery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mystery.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4" style={{ color: 'var(--primary-text-gray)' }}>Mysteries</h1>
      <div className="row">
        {filteredMysteries.length > 0 ? (
          filteredMysteries.map(mystery => (
            <div className="col-md-4 mb-4" key={mystery.id}>
              <div className="card h-100">
                {mystery.image && (
                  <img 
                    src={mystery.image.startsWith('http') ? mystery.image : `${API_BASE_URL}${mystery.image}`} 
                    className="card-img-top"
                    alt={mystery.title} 
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title" style={{ color: 'var(--primary-blue)' }}>
                    <Link to={`/mystery/${mystery.id}`} style={{ color: 'var(--primary-blue)' }}>{mystery.title}</Link>
                  </h5>
                  <p className="card-text" style={{ color: 'var(--secondary-text-gray)' }}>{mystery.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center" style={{ color: 'var(--primary-text-gray)' }}>No mysteries found</p>
        )}
      </div>
    </div>
  );
};

export default MysteryList;