import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error;

  const handleRetry = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="mb-4">
            <i className="fas fa-exclamation-circle text-danger" style={{ fontSize: '64px' }}></i>
          </div>
          <h2 className="mb-4">Something Went Wrong</h2>
          <p className="text-muted mb-4">
            {error || "We're having trouble loading this page. Please try again."}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button onClick={handleRetry} className="btn btn-primary">
              Go Back
            </button>
            <Link to="/" className="btn btn-outline-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 