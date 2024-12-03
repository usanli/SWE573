﻿import React, { useState } from 'react';
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
  const [showMysteryAttributes, setShowMysteryAttributes] = useState(false);
  const [selectedMysteryAttributes, setSelectedMysteryAttributes] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [identificationInputs, setIdentificationInputs] = useState({});
  const [identificationSuggestions, setIdentificationSuggestions] = useState({});
  const [selectedIdentificationClues, setSelectedIdentificationClues] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const mysteryAttributes = {
    Color: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Purple', 'Orange', 'Pink', 'Gray', 'Multicolored'],
    Size: ['Small', 'Medium', 'Large', 'Tiny', 'Oversized', 'Miniature'],
    Shape: ['Circular', 'Oval', 'Square', 'Rectangular', 'Triangular', 'Irregular', 'Cylindrical', 'Spherical', 'Flat', 'Curved'],
    Material: ['Metal', 'Plastic', 'Glass', 'Wood', 'Ceramic', 'Stone', 'Fabric', 'Rubber', 'Paper', 'Leather'],
    Texture: ['Smooth', 'Rough', 'Glossy', 'Matte', 'Textured', 'Soft', 'Hard'],
    'Purpose/Functionality': ['Decorative', 'Functional', 'Tool', 'Gadget', 'Toy', 'Clothing', 'Furniture', 'Kitchenware', 'Office Supply', 'Collectible'],
    Condition: ['New', 'Old', 'Worn', 'Damaged', 'Restored', 'Pristine'],
    Patterns: ['Striped', 'Dotted', 'Plain', 'Floral', 'Geometric', 'Abstract'],
    'Origin/Context': ['Handmade', 'Machine-made', 'Antique', 'Modern', 'Cultural Artifact', 'Mass-produced'],
    'Category/Type': ['Electronic', 'Mechanical', 'Stationery', 'Jewelry', 'Tool', 'Artwork', 'Furniture', 'Food-related', 'Clothing or Accessory'],
    'Identification Clues': ['Inscription/Engraving', 'Logo/Brand', 'Serial Number', 'Stamp/Mark', 'Barcode/QR Code'],
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleIdentificationInputChange = (clueCategory, value) => {
    setIdentificationInputs((prev) => ({ ...prev, [clueCategory]: value }));
    fetchIdentificationSuggestions(clueCategory, value);
  };

  const fetchIdentificationSuggestions = async (clueCategory, query) => {
    if (!query) {
      setIdentificationSuggestions((prev) => ({ ...prev, [clueCategory]: [] }));
      return;
    }
    try {
      const response = await axios.get(
        `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&language=en&limit=5&format=json&origin=*`
      );
      setIdentificationSuggestions((prev) => ({
        ...prev,
        [clueCategory]: response.data.search.map((result) => ({
          name: result.label,
          description: result.description,
          wikidata_id: result.id,
        })),
      }));
    } catch (error) {
      console.error(`Error fetching suggestions for ${clueCategory}:`, error);
    }
  };

  const addIdentificationClue = (clueCategory, clue) => {
    setSelectedIdentificationClues((prev) => ({
      ...prev,
      [clueCategory]: [...(prev[clueCategory] || []), clue],
    }));
    setIdentificationInputs((prev) => ({ ...prev, [clueCategory]: '' }));
    setIdentificationSuggestions((prev) => ({ ...prev, [clueCategory]: [] }));
  };

  const removeIdentificationClue = (clueCategory, index) => {
    setSelectedIdentificationClues((prev) => ({
      ...prev,
      [clueCategory]: prev[clueCategory].filter((_, i) => i !== index),
    }));
  };



  // Function to identify the image using Hugging Face BLIP API
  const identifyImage = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1]; // Remove the prefix

      const payload = {
        inputs: base64Image
      };

      try {
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
          payload,
          {
            headers: {
              Authorization: "Bearer ",
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data && response.data[0] && response.data[0].generated_text) {
          setDescription(response.data[0].generated_text);
        } else {
          console.error("No caption generated");
          setDescription("Could not generate a description for the image.");
        }
      } catch (error) {
        console.error("Error generating description:", error);
        setDescription("Error generating a description for the image.");
      }
    };
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      identifyImage(file);  // Call the identifyImage function when an image is uploaded
    }
  };

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
    formData.append(
      'tags',
      JSON.stringify([
        ...selectedTags,
        ...selectedMysteryAttributes.map((tag) => ({ name: tag })),
        ...Object.entries(selectedIdentificationClues).flatMap(([category, clues]) =>
          clues.map((clue) => ({
            name: clue.name,
            description: clue.description,
            category,
          }))
        ),
      ])
    );

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
        {/* Title Input Section */}
        <div className="form-group mt-3">
          <label htmlFor="title"><strong>Step 1: Title</strong></label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter a title for your mystery"
          />
        </div>

        {/* Image Upload Section */}
        <div className="form-group mt-3">
          <label htmlFor="image"><strong>Step 2: Upload an Image</strong></label>
          <input
            type="file"
            className="form-control"
            id="image"
            onChange={handleImageChange}
            accept="image/*"
          />
          <small className="form-text text-muted">
            Upload an image to generate a sample description. You can edit it later if needed.
          </small>
        </div>

        {/* Generated Description Section */}
        <div className="form-group mt-3">
          <label htmlFor="description"><strong>Step 3: Description</strong></label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ height: '100px' }}
            placeholder="Description will appear here after image upload"
          />
        </div>

{/* Mystery Attributes Section */}
<div className="form-group mt-3">
  <label>
    <strong>Step 4: Mystery Attributes</strong>
  </label>
  <div className="d-flex justify-content-start">
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => setShowMysteryAttributes(!showMysteryAttributes)}
    >
      {showMysteryAttributes ? 'Hide Mystery Attributes' : 'Show Mystery Attributes'}
    </button>
  </div>
  {showMysteryAttributes && (
    <div className="mt-3">
      {Object.entries(mysteryAttributes).map(([category, tags], categoryIndex) => (
        <div key={categoryIndex} className="mb-3">
          <button
            type="button"
            className="btn btn-link"
            style={{ textDecoration: 'none' }}
            onClick={() => toggleCategory(category)}
          >
            <strong>{category}</strong> {expandedCategories.includes(category) ? '▼' : '▶'}
          </button>
          {expandedCategories.includes(category) && (
            <>
              {/* Identification Clues Section */}
              {category === 'Identification Clues' ? (
                <div className="mt-3">
                  {tags.map((clueCategory, clueIndex) => (
                    <div key={clueIndex} className="mb-3">
                      <label>
                        <strong>{clueCategory}</strong>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Enter ${clueCategory}`}
                        value={identificationInputs[clueCategory] || ''}
                        onChange={(e) => handleIdentificationInputChange(clueCategory, e.target.value)}
                      />
                      <ul className="list-group mt-2">
                        {identificationSuggestions[clueCategory]?.map((suggestion, index) => (
                          <li
                            key={index}
                            className="list-group-item list-group-item-action"
                            onClick={() => addIdentificationClue(clueCategory, suggestion)}
                            style={{ cursor: 'pointer' }}
                          >
                            <strong>{suggestion.name}</strong> - {suggestion.description}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2">
                        <label><strong>Selected {clueCategory}:</strong></label>
                        <ul className="list-group">
                          {(selectedIdentificationClues[clueCategory] || []).map((clue, index) => (
                            <li
                              key={index}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              {clue.name} - {clue.description}
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeIdentificationClue(clueCategory, index)}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Display other attributes in two columns */
                <div className="row mt-3">
                  {tags.map((tag, tagIndex) => (
                    <div key={tagIndex} className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`${category}-${tag}`}
                          checked={selectedMysteryAttributes.includes(tag)}
                          onChange={() =>
                            setSelectedMysteryAttributes((prev) =>
                              prev.includes(tag)
                                ? prev.filter((t) => t !== tag)
                                : [...prev, tag]
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`${category}-${tag}`}
                        >
                          {tag}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )}
</div>




        {/* Tag Search and Selection Section */}
        <div className="form-group mt-3">
          <label htmlFor="tagSearch"><strong>Step 5: Additional Tags</strong></label>
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

        {/* Video and Audio Uploads */}
        <div className="form-group mt-3">
          <label htmlFor="video"><strong>Step 6: Additional Media</strong></label>
          <input
            type="file"
            className="form-control"
            id="video"
            onChange={(e) => setVideo(e.target.files[0])}
            accept="video/*"
          />
          <small className="form-text text-muted">Upload a video (optional).</small>
        </div>

        <div className="form-group mt-3">
          <input
            type="file"
            className="form-control"
            id="audio"
            onChange={(e) => setAudio(e.target.files[0])}
            accept="audio/*"
          />
          <small className="form-text text-muted">Upload an audio file (optional).</small>
        </div>

        <button type="submit" className="btn btn-primary mt-3 w-100">
          Submit Mystery
        </button>
      </form>
    </div>
  );
};

export default PostMystery;