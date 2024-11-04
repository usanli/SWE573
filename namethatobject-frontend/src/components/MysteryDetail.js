// src/components/MysteryDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Modal from 'react-modal';

const MysteryDetail = () => {
  const { id } = useParams();
  const [mystery, setMystery] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // Check if user is logged in

  useEffect(() => {
    // Fetch the mystery details
    axios.get(`${API_BASE_URL}/posts/${id}/`)
      .then(response => setMystery(response.data))
      .catch(error => console.error('Error fetching mystery:', error));

    // Fetch all comments and filter by post ID
    axios.get(`${API_BASE_URL}/comments/`)
      .then(response => {
        const postComments = response.data.filter(comment => comment.post === parseInt(id));
        setComments(postComments);
      })
      .catch(error => console.error('Error fetching comments:', error));
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    // Post new comment
    axios.post(`${API_BASE_URL}/comments/`, { post: id, text: newComment })
      .then(response => {
        setComments([...comments, response.data]);
        setNewComment('');
      })
      .catch(error => console.error('Error posting comment:', error));
  };

  const renderComments = (parentId = null) => {
    return comments
      .filter(comment => comment.parent === parentId)
      .map(comment => (
        <li key={comment.id} className="list-group-item">
          <strong>{comment.author.username}</strong>: {comment.text}
          <ul>{renderComments(comment.id)}</ul>
        </li>
      ));
  };

  const openModal = (media) => {
    setSelectedMedia(media);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMedia('');
  };

  if (!mystery) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">{mystery.title}</h1>
      <div className="text-center mb-4">
        {mystery.image && (
          <div className="media-container" onClick={() => openModal(mystery.image)}>
            <img 
              src={mystery.image.startsWith('http') ? mystery.image : `${API_BASE_URL}${mystery.image}`} 
              alt={mystery.title} 
              className="img-fluid"
              style={{ maxWidth: '300px', maxHeight: '200px' }}
            />
          </div>
        )}
        {mystery.video && (
          <div className="media-container" onClick={() => openModal(mystery.video)}>
            <video controls className="mt-4" style={{ maxWidth: '300px', maxHeight: '200px' }}>
              <source src={mystery.video.startsWith('http') ? mystery.video : `${API_BASE_URL}${mystery.video}`} type="video/mp4" />
            </video>
          </div>
        )}
        {mystery.audio && (
          <audio controls className="mt-4">
            <source src={mystery.audio.startsWith('http') ? mystery.audio : `${API_BASE_URL}${mystery.audio}`} type="audio/mpeg" />
          </audio>
        )}
      </div>
      <p>{mystery.description}</p>

      {/* Comments Section */}
      <div className="comments-section mt-5">
        <h3>Comments</h3>
        <ul className="list-group">
          {renderComments()} {/* Render top-level comments and their replies */}
        </ul>

        {/* Render comment box only for logged-in users */}
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <div className="form-group">
              <label htmlFor="newComment">Add a comment:</label>
              <textarea
                id="newComment"
                className="form-control"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2">Submit Comment</button>
          </form>
        ) : (
          <p className="mt-4">You must be logged in to comment.</p>
        )}
      </div>

      {/* Modal for full-size media */}
      <Modal 
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        ariaHideApp={false}
      >
        <button onClick={closeModal}>Close</button>
        {selectedMedia && (
          <div>
            {selectedMedia.endsWith('.mp4') || selectedMedia.endsWith('.webm') ? (
              <video controls style={{ width: '100%' }}>
                <source src={selectedMedia} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={selectedMedia} alt="Full Size" style={{ width: '100%' }} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MysteryDetail;
