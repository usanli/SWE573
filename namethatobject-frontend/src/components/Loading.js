import React from 'react';

const Loading = () => {
  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mb-0">Loading...</h4>
        </div>
      </div>
    </div>
  );
};

export default Loading; 