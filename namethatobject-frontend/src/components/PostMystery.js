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
    <div className="container mt-4">
      <h2>Post a Mystery</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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

        <div className="form-group mt-3">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            className="form-control"
            value={tagInput}
            onChange={handleTagInputChange}
            placeholder="Start typing to see suggestions..."
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
              </span>
            ))}
          </div>
        </div>

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

        <button type="submit" className="btn btn-primary mt-4">Post Mystery</button>
      </form>
    </div>
  );
};

export default PostMystery;
