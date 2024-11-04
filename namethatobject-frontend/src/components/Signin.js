// src/components/Signin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api-token-auth/', credentials);
            const token = response.data.token;
            const username = credentials.username; // Store the username from credentials
            
            localStorage.setItem('token', token);  // Save token for authenticated requests
            localStorage.setItem('userData', JSON.stringify({ username })); // Store username in local storage
            localStorage.setItem('successMessage', 'Login successful!');  // Store success message
            
            navigate('/');  // Redirect to the main page
        } catch (error) {
            setMessage('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" value={credentials.username} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
                <button type="submit">Sign In</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default Signin;
