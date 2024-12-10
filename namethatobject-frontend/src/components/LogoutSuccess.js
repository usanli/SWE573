import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <i className="fas fa-check-circle text-success mb-4" style={{ fontSize: '48px' }}></i>
          <h3 className="mb-3">Successfully Logged Out</h3>
          <p className="text-muted mb-3">
            Thank you for using NameThatObject. You will be redirected to the home page shortly.
          </p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutSuccess; 