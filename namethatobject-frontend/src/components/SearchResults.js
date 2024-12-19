import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, MYSTERIES_ENDPOINT, getMediaUrl } from '../config';
import { getCloudinaryUrl } from '../utils/cloudinary';

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState(
    new URLSearchParams(location.search).get('q') || ''
  );

  // Filter states
  const [filters, setFilters] = useState({
    Color: [],
    Size: [],
    Shape: [],
    Material: [],
    Texture: [],
    'Purpose/Functionality': [],
    Condition: [],
    Patterns: [],
    'Origin/Context': [],
    'Category/Type': [],
  });

  const filterOptions = {
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
  };

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, filters]);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [location.search]);

  const fetchSearchResults = () => {
    axios.get(MYSTERIES_ENDPOINT).then((response) => {
      let filteredResults = response.data.filter((mystery) => {
        const query = searchQuery.toLowerCase();
        return (
          mystery.title.toLowerCase().includes(query) ||
          mystery.description.toLowerCase().includes(query) ||
          mystery.tags?.some((tag) => tag.name.toLowerCase().includes(query))
        );
      });

      // Apply strict filtering logic
      Object.keys(filters).forEach((filterKey) => {
        const selectedValues = filters[filterKey];
        if (selectedValues.length > 0) {
          filteredResults = filteredResults.filter((mystery) =>
            selectedValues.every((value) =>
              mystery.tags?.some(
                (tag) =>
                  tag.description === filterKey &&
                  tag.name.toLowerCase() === value.toLowerCase()
              )
            )
          );
        }
      });

      setResults(filteredResults);
    });
  };

  const handleCheckboxChange = (filterKey, option, isChecked) => {
    setFilters((prevFilters) => {
      const updatedFilter = prevFilters[filterKey] || [];
      if (isChecked) {
        // Add the option if checked
        return {
          ...prevFilters,
          [filterKey]: [...updatedFilter, option],
        };
      } else {
        // Remove the option if unchecked
        return {
          ...prevFilters,
          [filterKey]: updatedFilter.filter((item) => item !== option),
        };
      }
    });
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Search Results</h1>

      {/* Advanced Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by title, description, or tags"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
<div className="filters mb-4">
  <div className="dropdown">
    <button
      className="btn btn-secondary dropdown-toggle w-100"
      type="button"
      id="mainAdvancedFiltersDropdown"
      data-bs-toggle="collapse"
      data-bs-target="#mainAdvancedFiltersContent"
      aria-expanded="false"
      aria-controls="mainAdvancedFiltersContent"
    >
      Advanced Filters
    </button>
    <div id="mainAdvancedFiltersContent" className="collapse mt-3">
      <div className="accordion" id="filtersAccordion">
        {Object.keys(filterOptions).map((filterKey, index) => (
          <div key={filterKey} className="accordion-item">
            <h2 className="accordion-header" id={`heading-${index}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${index}`}
                aria-expanded="false"
                aria-controls={`collapse-${index}`}
              >
                {filterKey}
              </button>
            </h2>
            <div
              id={`collapse-${index}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${index}`}
              data-bs-parent="#filtersAccordion"
            >
              <div className="accordion-body">
                {filterOptions[filterKey].map((option) => (
                  <div key={option} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`${filterKey}-${option}`}
                      value={option}
                      checked={filters[filterKey]?.includes(option) || false}
                      onChange={(e) => handleCheckboxChange(filterKey, option, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`${filterKey}-${option}`}>
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>


      {/* Search Results */}
      {results.length > 0 ? (
        <>
          <ul className="list-group">
            {results.slice(0, visibleCount).map((mystery) => (
              <li key={mystery.id} className="list-group-item">
                <div className="row align-items-center">
                  {/* Left column for images */}
                  <div className="col-auto">
                    {mystery.image && (
                      <img
                        src={getMediaUrl(mystery.image_url)}
                        alt={mystery.title}
                        className="search-result-image mb-2"
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    )}
                  </div>

                  {/* Right column for content */}
                  <div className="col">
                    {/* Author info row */}
                    <div className="d-flex align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            mystery.is_anonymous
                              ? `https://ui-avatars.com/api/?name=Anonymous&background=random&size=32`
                              : mystery.author?.profile?.profile_picture
                                ? getCloudinaryUrl(mystery.author.profile.profile_picture)
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(mystery.author?.username || 'Anonymous')}&background=random&size=32`
                          }
                          alt={mystery.is_anonymous ? 'Anonymous' : mystery.author?.username}
                          className="rounded-circle me-2"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mystery.author?.username || 'Anonymous')}&background=random&size=32`;
                          }}
                        />
                        {mystery.is_anonymous ? (
                          <span className="text-muted">Anonymous</span>
                        ) : (
                          <Link to={`/profile/${mystery.author?.username}`} className="text-decoration-none">
                            <span>{mystery.author?.username}</span>
                          </Link>
                        )}
                      </div>
                      <span className="text-muted ms-2">
                        • {new Date(mystery.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Title and description */}
                    <h5 className="mb-2">
                      <Link to={`/mystery/${mystery.id}`} className="text-decoration-none">
                        {mystery.title}
                      </Link>
                    </h5>
                    <p className="mb-2">{mystery.description}</p>

                    {/* Tags */}
                    {mystery.tags && (
                      <div className="tags">
                        {mystery.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="badge bg-light text-dark me-1"
                            style={{ 
                              padding: '5px 10px',
                              borderRadius: '15px',
                              border: '1px solid #dee2e6'
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {visibleCount < results.length && (
            <div className="text-center mt-4">
              <button className="btn btn-primary" onClick={() => setVisibleCount(visibleCount + 10)}>
                See More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center">No results found</p>
      )}
    </div>
  );
};

export default SearchResults;