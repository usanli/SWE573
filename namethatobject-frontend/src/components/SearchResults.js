import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, MYSTERIES_ENDPOINT } from '../config';

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get('query') || '');

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
              <li key={mystery.id} className="list-group-item d-flex align-items-center">
                {mystery.image && (
                  <img
                    src={mystery.image.startsWith('http') ? mystery.image : `${API_BASE_URL}${mystery.image}`}
                    alt={mystery.title}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginRight: '15px',
                    }}
                  />
                )}
                <div>
                  <h5>
                    <Link to={`/mystery/${mystery.id}`} className="text-decoration-none">
                      {mystery.title}
                    </Link>
                  </h5>
                  <p>{mystery.description}</p>
                  <div className="d-flex align-items-center mb-2">
                    {mystery.is_anonymous ? (
                      <span className="text-muted">
                        <i className="fas fa-user-secret me-1"></i>
                        Anonymous
                      </span>
                    ) : (
                      <Link 
                        to={`/profile/${mystery.author?.username}`}
                        className="text-decoration-none text-muted"
                      >
                        <i className="fas fa-user me-1"></i>
                        {mystery.author?.username}
                      </Link>
                    )}
                    <span className="mx-2">•</span>
                    <small className="text-muted">
                      {new Date(mystery.created_at).toLocaleString()}
                    </small>
                  </div>
                  {mystery.tags && (
                    <div className="tags mt-2">
                      {mystery.tags.map((tag, index) => (
                        <span key={index} className="badge me-1">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
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
