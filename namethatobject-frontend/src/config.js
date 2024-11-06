// src/config.js
console.log("API_BASE_URL:", process.env.REACT_APP_API_BASE_URL);
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const MYSTERIES_ENDPOINT = `${API_BASE_URL}/posts/`;