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
  const [showMysteryAttributes, setShowMysteryAttributes] = useState(false);
  const [selectedMysteryAttributes, setSelectedMysteryAttributes] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [identificationInputs, setIdentificationInputs] = useState({});
  const [identificationSuggestions, setIdentificationSuggestions] = useState({});
  const [selectedIdentificationClues, setSelectedIdentificationClues] = useState({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [partsRelation, setPartsRelation] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              Authorization: `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
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
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Basic fields
    formData.append('title', title);
    formData.append('description', description);
    formData.append('is_anonymous', isAnonymous);
    formData.append('parts_relation', partsRelation);

    // Media files with validation
    if (image) {
        if (image.size > 10 * 1024 * 1024) { // 10MB limit
            alert('Image file is too large. Maximum size is 10MB.');
            setIsSubmitting(false);
            return;
        }
        console.log('Appending image:', image.name);
        formData.append('image', image);
    }
    if (video) {
        if (video.size > 50 * 1024 * 1024) { // 50MB limit
            alert('Video file is too large. Maximum size is 50MB.');
            setIsSubmitting(false);
            return;
        }
        console.log('Appending video:', video.name);
        formData.append('video', video);
    }
    if (audio) {
        if (audio.size > 10 * 1024 * 1024) { // 10MB limit
            alert('Audio file is too large. Maximum size is 10MB.');
            setIsSubmitting(false);
            return;
        }
        console.log('Appending audio:', audio.name);
        formData.append('audio', audio);
    }

    // Format and append tags
    const allTags = [
        ...selectedTags,
        ...Object.entries(mysteryAttributes).flatMap(([category, attributes]) =>
            selectedMysteryAttributes
                .filter(attr => attributes.includes(attr))
                .map(attr => ({
                    name: attr,
                    description: category,
                    wikidata_id: null
                }))
        ),
        ...Object.entries(selectedIdentificationClues).flatMap(([category, clues]) =>
            clues.map(clue => ({
                name: clue.name,
                description: category,
                wikidata_id: clue.wikidata_id || null
            }))
        )
    ];

    formData.append('tags', JSON.stringify(allTags));

    try {
        console.log('Submitting form data...');
        const response = await axios.post(`${API_BASE_URL}/posts/`, formData, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Upload progress:', percentCompleted);
                // You can add a progress bar here if desired
            }
        });
        console.log('Post created:', response.data);
        navigate(`/mystery/${response.data.id}`);
    } catch (error) {
        console.error('Error creating post:', error);
        console.error('Error response:', error.response?.data);
        let errorMessage = 'Error creating post. ';
        if (error.response?.data) {
            if (typeof error.response.data === 'object') {
                Object.entries(error.response.data).forEach(([key, value]) => {
                    errorMessage += `${key}: ${value} `;
                });
            } else {
                errorMessage += error.response.data;
            }
        }
        alert(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <div className="card shadow-sm fade-in">
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Share Your Mystery</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Title Input Section */}
            <div className="form-group mb-4">
              <label className="form-label fw-bold">
                <i className="fas fa-heading me-2"></i>Title
              </label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title of your mystery..."
                style={{ borderRadius: '10px' }}
                required
              />
              <div className="form-check mt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="anonymousCheck">
                  Post Anonymously
                </label>
                <small className="text-muted d-block">
                  Your identity will be hidden from other users, but you'll still be able to manage your post.
                </small>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="form-group mb-4">
              <label className="form-label fw-bold">
                <i className="fas fa-image me-2"></i>Upload Image
              </label>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control"
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <small className="text-muted">
                Upload an image to automatically generate a description
              </small>
            </div>

            {/* Description Section */}
            <div className="form-group mb-4">
              <label className="form-label fw-bold">
                <i className="fas fa-align-left me-2"></i>Description
              </label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                placeholder="Describe your mystery in detail..."
                style={{ borderRadius: '10px' }}
              />
            </div>

            {/* Parts Relation Section */}
            <div className="form-group mb-4">
              <label className="form-label fw-bold">
                <i className="fas fa-puzzle-piece me-2"></i>Parts Relation
                <small className="text-muted ms-2">(Optional)</small>
              </label>
              <textarea
                className="form-control"
                value={partsRelation}
                onChange={(e) => setPartsRelation(e.target.value)}
                placeholder="If your mystery object has multiple parts, describe how they are related or connected to each other..."
                rows="3"
                style={{ borderRadius: '10px' }}
              />
              <small className="text-muted">
                Example: "The smaller circular part fits into the larger square base."
              </small>
            </div>

            {/* Mystery Attributes Section */}
            <div className="form-group mb-4">
              <label className="form-label fw-bold">
                <i className="fas fa-tags me-2"></i>Mystery Attributes
              </label>
              <button
                type="button"
                className="btn btn-outline-primary w-100 mb-3"
                onClick={() => setShowMysteryAttributes(!showMysteryAttributes)}
                style={{ borderRadius: '10px' }}
              >
                {showMysteryAttributes ? 'Hide Attributes' : 'Show Attributes'}
              </button>

              {showMysteryAttributes && (
                <div className="card border-light">
                  <div className="card-body">
                    <div className="row">
                      {Object.entries(mysteryAttributes).map(([category, attributes]) => (
                        <div key={category} className="col-md-6 mb-3">
                          <h6 className="mb-2">{category}</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {attributes.map((attr) => (
                              <div key={attr} className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`attr-${attr}`}
                                  checked={selectedMysteryAttributes.includes(attr)}
                                  onChange={() => {
                                    setSelectedMysteryAttributes(prev =>
                                      prev.includes(attr)
                                        ? prev.filter(a => a !== attr)
                                        : [...prev, attr]
                                    );
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`attr-${attr}`}>
                                  {attr}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Tags Section */}
            <div className="form-group mb-4">
              <label className="form-label fw-bold">
                <i className="fas fa-tags me-2"></i>Additional Tags
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search for tags..."
                value={tagSearch}
                onChange={handleTagSearchChange}
                style={{ borderRadius: '10px' }}
              />
              {tagSuggestions.length > 0 && (
                <div className="card mt-2">
                  <ul className="list-group list-group-flush">
                    {tagSuggestions.map((tag, index) => (
                      <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        onClick={() => addTag(tag)}
                        style={{ cursor: 'pointer' }}
                      >
                        <strong>{tag.name}</strong>
                        {tag.description && ` - ${tag.description}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTags.length > 0 && (
                <div className="selected-tags mt-3">
                  <h6 className="mb-2">Selected Tags:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="badge bg-primary d-flex align-items-center"
                        style={{ padding: '8px', fontSize: '0.9rem' }}
                      >
                        {tag.name}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => removeTag(index)}
                        ></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Identification Clues Section */}
            {showMysteryAttributes && (
              <div className="form-group mb-4">
                <label className="form-label fw-bold">
                  <i className="fas fa-search me-2"></i>Identification Clues
                </label>
                {mysteryAttributes['Identification Clues'].map((clueCategory) => (
                  <div key={clueCategory} className="mb-3">
                    <label className="form-label">{clueCategory}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Enter ${clueCategory}`}
                      value={identificationInputs[clueCategory] || ''}
                      onChange={(e) => handleIdentificationInputChange(clueCategory, e.target.value)}
                      style={{ borderRadius: '10px' }}
                    />
                    
                    {identificationSuggestions[clueCategory]?.length > 0 && (
                      <div className="card mt-2">
                        <ul className="list-group list-group-flush">
                          {identificationSuggestions[clueCategory].map((suggestion, index) => (
                            <li
                              key={index}
                              className="list-group-item list-group-item-action"
                              onClick={() => addIdentificationClue(clueCategory, suggestion)}
                              style={{ cursor: 'pointer' }}
                            >
                              <strong>{suggestion.name}</strong>
                              {suggestion.description && ` - ${suggestion.description}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedIdentificationClues[clueCategory]?.length > 0 && (
                      <div className="selected-clues mt-2">
                        <h6 className="mb-2">Selected {clueCategory}:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedIdentificationClues[clueCategory].map((clue, index) => (
                            <span
                              key={index}
                              className="badge bg-info d-flex align-items-center"
                              style={{ padding: '8px', fontSize: '0.9rem' }}
                            >
                              {clue.name}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => removeIdentificationClue(clueCategory, index)}
                              ></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Additional Media Section */}
            <div className="form-group mb-4">
              <label className="form-label fw-bold">
                <i className="fas fa-film me-2"></i>Additional Media
              </label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setVideo(e.target.files[0])}
                accept="video/*"
                style={{ borderRadius: '10px' }}
              />
              <small className="text-muted d-block mb-3">Upload a video (optional)</small>

              <input
                type="file"
                className="form-control"
                onChange={(e) => setAudio(e.target.files[0])}
                accept="audio/*"
                style={{ borderRadius: '10px' }}
              />
              <small className="text-muted d-block">Upload an audio file (optional)</small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              style={{ borderRadius: '10px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Uploading...
                  </>
              ) : (
                  'Post Mystery'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostMystery;