// src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const signupResponse = await axios.post(`${API_BASE_URL}/api/signup/`, formData);
            const { username, token } = signupResponse.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify({ username }));
            setMessage(`Signup successful! Welcome, ${username}!`);
            navigate('/');
        } catch (error) {
            const errorMessage = error.response?.data || 'Signup failed. Please check your input and try again.';
            setMessage(errorMessage);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg fade-in">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4">Create Account</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: '10px' }}
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        name="email"
                                        value={formData.email}
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
                                        value={formData.password}
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
                                    Sign Up
                                </button>
                            </form>
                            
                            {message && (
                                <div className="alert alert-info mt-4 text-center fade-in">
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

export default Signup;
