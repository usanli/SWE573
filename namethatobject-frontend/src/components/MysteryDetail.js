// src/components/MysteryDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const MysteryDetail = () => {
  const { id } = useParams();
  const [mystery, setMystery] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

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

  // Function to render comments with nesting for replies
  const renderComments = (parentId = null) => {
    return comments
      .filter(comment => comment.parent === parentId)
      .map(comment => (
        <li key={comment.id} className="list-group-item">
          <strong>{comment.author.username}</strong>: {comment.text}
          <ul>{renderComments(comment.id)}</ul> {/* Recursively render replies */}
        </li>
      ));
  };

  if (!mystery) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">{mystery.title}</h1>
      <div className="text-center mb-4">
        {mystery.image && (
          <img 
            src={mystery.image.startsWith('http') ? mystery.image : `${API_BASE_URL}${mystery.image}`} 
            alt={mystery.title} 
            className="img-fluid" 
          />
        )}
        {mystery.video && (
          <video controls className="mt-4 w-100">
            <source src={mystery.video.startsWith('http') ? mystery.video : `${API_BASE_URL}${mystery.video}`} type="video/mp4" />
          </video>
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
      </div>
    </div>
  );
};

export default MysteryDetail;
