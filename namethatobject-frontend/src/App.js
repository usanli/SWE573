// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import MysteryList from './components/MysteryList';
import MysteryDetail from './components/MysteryDetail';
import SearchResults from './components/SearchResults';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Profile from './components/Profile';  // Import the Profile component

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Routes>
        <Route path="/" element={<MysteryList searchTerm={searchTerm} />} />
        <Route path="/mystery/:id" element={<MysteryDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile" element={<Profile />} />  {/* Add the profile route */}
      </Routes>
    </Router>
  );
};

export default App;
