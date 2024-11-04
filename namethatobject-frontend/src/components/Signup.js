// src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        name: '',
        surname: '',
        date_of_birth: ''
    });

    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Use navigate to redirect

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sign up the user
            const signupResponse = await axios.post(`${API_BASE_URL}/signup/`, formData);
            const { username, token } = signupResponse.data;

            // Store the token in local storage
            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify({ username }));

            // Show success message and redirect to the main page
            setMessage(`Signup successful! Welcome, ${username}!`);
            navigate('/'); // Redirect to main page
        } catch (error) {
            setMessage('Signup failed. Please check your input and try again.');
        }
    };



    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="text" name="name" placeholder="First Name" value={formData.name} onChange={handleChange} required />
                <input type="text" name="surname" placeholder="Last Name" value={formData.surname} onChange={handleChange} required />
                <input type="date" name="date_of_birth" placeholder="Date of Birth" value={formData.date_of_birth} onChange={handleChange} required />
                <button type="submit">Sign Up</button>
            </form>
            <p>{message}</p> {/* Display success/error message */}
        </div>
    );
};

export default Signup;
