// src/components/SearchResults.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MYSTERIES_ENDPOINT } from '../config';

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const query = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    if (query) {
      axios.get(MYSTERIES_ENDPOINT)
        .then(response => {
          const filteredMysteries = response.data.filter(mystery =>
            mystery.title.toLowerCase().includes(query.toLowerCase()) ||
            mystery.description.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filteredMysteries);
        })
        .catch(error => console.error('Error fetching search results:', error));
    }
  }, [query]);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Search Results for "{query}"</h1>
      {results.length > 0 ? (
        <ul className="list-group">
          {results.map(mystery => (
            <li key={mystery.id} className="list-group-item">
              <h5>
                <Link to={`/mystery/${mystery.id}`} className="text-decoration-none">
                  {mystery.title}
                </Link>
              </h5>
              <p>{mystery.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">No results found</p>
      )}
    </div>
  );
};

export default SearchResults;
