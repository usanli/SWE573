// src/components/Signin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

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
            const response = await axios.post(`${API_BASE_URL}/api-token-auth/`, credentials);
            const token = response.data.token;
            const username = credentials.username;
            
            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify({ username }));
            localStorage.setItem('successMessage', 'Login successful!');
            
            navigate('/');
        } catch (error) {
            setMessage('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            id="username" 
                            className="form-control" 
                            placeholder="Enter your username" 
                            value={credentials.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            className="form-control" 
                            placeholder="Enter your password" 
                            value={credentials.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Sign In</button>
                </form>
                {message && (
                    <div className="alert alert-danger mt-4 text-center">{message}</div>
                )}
            </div>
        </div>
    );
};

export default Signin;
