import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const TestRunner = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('frontend');
  const [selectedSuite, setSelectedSuite] = useState('all');

  const testSuites = [
    {
      type: 'frontend',
      suites: [
        { id: 'all', name: 'All Frontend Tests' },
        { id: 'App.test.js', name: 'App Tests' },
        { id: 'MysteryDetail.test.js', name: 'Mystery Detail Tests' },
        { id: 'MysteryList.test.js', name: 'Mystery List Tests' },
        { id: 'Navbar.test.js', name: 'Navbar Tests' },
        { id: 'Profile.test.js', name: 'Profile Tests' },
        { id: 'SearchResults.test.js', name: 'Search Results Tests' }
      ]
    },
    {
      type: 'backend',
      suites: [
        { id: 'all', name: 'All Backend Tests' },
        { id: 'main.tests.PostTests', name: 'Post Tests' },
        { id: 'main.tests.CommentTests', name: 'Comment Tests' },
        { id: 'main.tests.UserTests', name: 'User Tests' }
      ]
    }
  ];

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/run-tests/`, {
        suite: selectedSuite,
        type: selectedType
      }, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      
      setTestResults(response.data);
    } catch (err) {
      console.error('Test runner error:', err.response || err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Failed to run tests. Please check the console for details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatOutput = (output) => {
    if (!output) return null;
    return output.split('\n').map((line, index) => (
      <div 
        key={index} 
        className={
          line.includes('PASS') ? 'text-success' :
          line.includes('FAIL') ? 'text-danger' :
          ''
        }
      >
        {line}
      </div>
    ));
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Test Runner</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Test Type</label>
            <select 
              className="form-select mb-3"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedSuite('all');
              }}
            >
              <option value="frontend">Frontend Tests</option>
              <option value="backend">Backend Tests</option>
            </select>

            <label className="form-label">Select Test Suite</label>
            <select 
              className="form-select"
              value={selectedSuite}
              onChange={(e) => setSelectedSuite(e.target.value)}
            >
              {testSuites
                .find(t => t.type === selectedType)
                .suites.map(suite => (
                  <option key={suite.id} value={suite.id}>
                    {suite.name}
                  </option>
                ))}
            </select>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={runTests}
            disabled={loading}
          >
            {loading ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error: </strong>{error}
        </div>
      )}

      {testResults && (
        <div className="card">
          <div className="card-header">
            Test Results
          </div>
          <div className="card-body">
            <pre className="test-output">
              {formatOutput(testResults.output)}
            </pre>
            {testResults.errors && (
              <div className="mt-3 text-danger">
                <h5>Errors:</h5>
                <pre>{testResults.errors}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner; 