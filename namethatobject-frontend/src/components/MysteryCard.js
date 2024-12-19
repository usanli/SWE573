import React from 'react';
import { Link } from 'react-router-dom';

const MysteryCard = ({ mystery }) => {
  return (
    <div className="card h-100">
      {mystery.image && (
        <img 
          src={mystery.image} 
          className="card-img-top" 
          alt={mystery.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{mystery.title}</h5>
        <p className="card-text">
          {mystery.description.length > 100
            ? `${mystery.description.substring(0, 100)}...`
            : mystery.description}
        </p>
        <Link to={`/mystery/${mystery.id}`} className="btn btn-primary">
          View Mystery
        </Link>
      </div>
      <div className="card-footer text-muted">
        <small>Posted by {mystery.author}</small>
      </div>
    </div>
  );
};

export default MysteryCard; 