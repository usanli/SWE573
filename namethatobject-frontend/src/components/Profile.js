// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token'); // Get the token from local storage
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/user/profile/`, {
            headers: {
              Authorization: `Token ${token}`  // Include the token in the authorization header
            }
          });
          setUserData(response.data);  // Set user data from response
        } catch (err) {
          setError('Failed to fetch user data.');
          console.error(err);
        }
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mt-4">
      <h2>User Profile</h2>
      {userData ? (
        <div>
          <h4>Username: {userData.username}</h4>
          <h4>Email: {userData.email}</h4>
          <h4>Name: {userData.profile.name}</h4>
          <h4>Surname: {userData.profile.surname}</h4>
          <h4>Date of Birth: {userData.profile.date_of_birth}</h4>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default Profile;
