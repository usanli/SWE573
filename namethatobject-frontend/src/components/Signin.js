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
            console.error('Login error:', error);
            setMessage('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg fade-in">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4">Welcome Back</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        name="username"
                                        value={credentials.username}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: '10px' }}
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: '10px' }}
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100"
                                    style={{ borderRadius: '10px' }}
                                >
                                    Sign In
                                </button>
                            </form>
                            
                            {message && (
                                <div className="alert alert-danger mt-4 text-center fade-in">
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;
