import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const PostMystery = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchTagSuggestions = async (query) => {
    if (!query) return setTagSuggestions([]);
    try {
      const response = await axios.get(
        `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&language=en&limit=5&format=json&origin=*`
      );
      setTagSuggestions(
        response.data.search.map((result) => ({
          name: result.label,
          description: result.description,
          wikidata_id: result.id,
        }))
      );
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
    }
  };

  const handleTagSearchChange = (e) => {
    setTagSearch(e.target.value);
    fetchTagSuggestions(e.target.value);
  };

  const addTag = (tag) => {
    setSelectedTags([...selectedTags, tag]);
    setTagSearch('');
    setTagSuggestions([]);
  };

  const removeTag = (index) => {
    setSelectedTags(selectedTags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(selectedTags));
    if (image) formData.append('image', image);
    if (video) formData.append('video', video);
    if (audio) formData.append('audio', audio);

    try {
      const response = await axios.post(`${API_BASE_URL}/posts/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Post created:', response.data);
      navigate(`/mystery/${response.data.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <h2 className="text-center">Post a Mystery</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mt-3">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ height: '100px' }}
          />
        </div>

        <div className="form-group mt-3">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            className="form-control"
            id="image"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
          />
        </div>

        <div className="form-group mt-3">
          <label htmlFor="video">Video</label>
          <input
            type="file"
            className="form-control"
            id="video"
            onChange={(e) => setVideo(e.target.files[0])}
            accept="video/*"
          />
        </div>

        <div className="form-group mt-3">
          <label htmlFor="audio">Audio</label>
          <input
            type="file"
            className="form-control"
            id="audio"
            onChange={(e) => setAudio(e.target.files[0])}
            accept="audio/*"
          />
        </div>

        <div className="form-group mt-3">
          <label htmlFor="tagSearch">Tags</label>
          <input
            type="text"
            className="form-control"
            id="tagSearch"
            placeholder="Type to search for tags"
            value={tagSearch}
            onChange={handleTagSearchChange}
          />
          <ul className="list-group mt-1">
            {tagSuggestions.map((tag, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onClick={() => addTag(tag)}
                style={{ cursor: 'pointer' }}
              >
                <strong>{tag.name}</strong> - {tag.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="form-group mt-3">
          <label>Selected Tags:</label>
          <ul className="list-group">
            {selectedTags.map((tag, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                {tag.name} - {tag.description}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeTag(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="btn btn-primary mt-3 w-100">
          Submit Mystery
        </button>
      </form>
    </div>
  );
};

export default PostMystery;
