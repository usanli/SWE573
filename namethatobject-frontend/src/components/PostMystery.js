// src/components/PostMystery.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const PostMystery = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tags/`);
        setSuggestedTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleTagInputChange = (e) => {
    const input = e.target.value;
    setTagInput(input);

    const filteredTags = suggestedTags.filter(tag =>
      tag.name.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestedTags(filteredTags);
  };

  const addTag = (tag) => {
    if (!tags.some(existingTag => existingTag.id === tag.id)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tagId) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'image') {
      setImage(files[0]);
    } else if (name === 'audio') {
      setAudio(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags.map(tag => tag.id));
    if (image) formData.append('image', image);
    if (audio) formData.append('audio', audio);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(`${API_BASE_URL}/posts/`, formData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Mystery posted successfully!');
      navigate(`/mystery/${response.data.id}`);
    } catch (error) {
      console.error('Error posting mystery:', error);
      setMessage('Failed to post mystery. Please try again.');
    }
  };

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <h2 className="text-center mb-4">Post a Mystery</h2>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description Field */}
          <div className="form-group mt-3">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Tags Field with Suggestions */}
          <div className="form-group mt-3">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              className="form-control"
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="Type to add tags..."
            />
            {tagInput && (
              <ul className="list-group mt-1">
                {suggestedTags.map(tag => (
                  <li
                    key={tag.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => addTag(tag)}
                    style={{ cursor: 'pointer' }}
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2">
              {tags.map(tag => (
                <span key={tag.id} className="badge bg-primary me-1">
                  {tag.name}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    aria-label="Remove"
                    onClick={() => removeTag(tag.id)}
                    style={{ fontSize: '0.7rem' }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* File Uploads for Image and Audio */}
          <div className="form-group mt-3">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="form-group mt-3">
            <label htmlFor="audio">Upload Audio</label>
            <input
              type="file"
              id="audio"
              name="audio"
              accept="audio/*"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary mt-4 w-100">
            Post Mystery
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostMystery;
