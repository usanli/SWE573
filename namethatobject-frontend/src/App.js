// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import MysteryList from './components/MysteryList'; // Updated import
import MysteryDetail from './components/MysteryDetail';
import SearchResults from './components/SearchResults';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Routes>
        <Route path="/" element={<MysteryList searchTerm={searchTerm} />} />  {/* Updated component */}
        <Route path="/mystery/:id" element={<MysteryDetail />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  );
};

export default App;
