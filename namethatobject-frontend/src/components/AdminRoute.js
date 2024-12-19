import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const isAdmin = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const adminUsers = ['usanli', 'suzan'];
      return userData && adminUsers.includes(userData.username);
    } catch (error) {
      return false;
    }
  };

  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute; 