// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';  // Import the Footer
import MysteryList from './components/MysteryList';
import MysteryDetail from './components/MysteryDetail';
import SearchResults from './components/SearchResults';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Profile from './components/Profile';
import PostMystery from './components/PostMystery';
import LogoutSuccess from './components/LogoutSuccess';
import NotFound from './components/NotFound';
import ErrorPage from './components/ErrorPage';
import TestRunner from './components/TestRunner';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AdminRoute from './components/AdminRoute';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<MysteryList searchTerm={searchTerm} />} />
            <Route path="/mystery/:id" element={<MysteryDetail />} />
            <Route path="/search" element={<SearchResults searchTerm={searchTerm} setSearchTerm={setSearchTerm} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/post-mystery" element={<PostMystery />} />
            <Route path="/logout-success" element={<LogoutSuccess />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route 
              path="/test-runner" 
              element={
                <AdminRoute>
                  <TestRunner />
                </AdminRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />  {/* Add Footer here */}
      </div>
    </Router>
  );
};

export default App;
