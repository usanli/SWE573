// src/config.js
console.log("API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
export const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dbrvvzoys/image/upload';
export const MYSTERIES_ENDPOINT = `${API_BASE_URL}/posts/`;

export const getMediaUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL, clean it up
    if (path.startsWith('http')) {
        // Ensure https
        path = path.replace('http://', 'https://');
        return path;
    }
    
    // If it's just a public_id, construct the full URL
    return `${CLOUDINARY_BASE_URL}/${path}`;
};