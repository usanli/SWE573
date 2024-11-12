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
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mysteryResponse = await axios.get(`${API_BASE_URL}/posts/${id}/`);
        setMystery(mysteryResponse.data);

        const commentsResponse = await axios.get(`${API_BASE_URL}/comments/`);
        const postComments = commentsResponse.data.filter(comment => comment.post === parseInt(id));

        // Structure comments to nest replies under their parent comments
        const structuredComments = postComments.reduce((acc, comment) => {
          if (!comment.parent) {
            // If comment has no parent, add it to the main comments list
            acc.push({ ...comment, replies: [] });
          } else {
            // Find the parent comment and add this as a reply
            const parentComment = acc.find(c => c.id === comment.parent);
            if (parentComment) {
              parentComment.replies.push(comment);
            }
          }
          return acc;
        }, []);

        setComments(structuredComments);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/`,
        { post: id, text: newComment, parent: "" },
        { headers: { Authorization: `Token ${token}` } }
      );

      setComments([...comments, { ...response.data, replies: [] }]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/`,
        { post: id, text: replyText, parent: parentId },
        { headers: { Authorization: `Token ${token}` } }
      );

      // Add the reply to the correct parent comment
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...comment.replies, response.data] };
        }
        return comment;
      });

      setComments(updatedComments);
      setReplyText('');
      setReplyCommentId(null);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const renderTags = () => (
    mystery?.tags && mystery.tags.length > 0 && (
      <div style={{ marginTop: '20px' }}>
        <h5>Tags:</h5>
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {mystery.tags.map((tag, index) => (
            <li key={index} style={{ display: 'inline', marginRight: '10px' }}>
              <span style={{
                padding: '5px 10px',
                borderRadius: '5px',
                backgroundColor: '#6c757d',
                color: '#fff'
              }}>
                {tag.name} (ID: {tag.wikidata_id})
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  );

  const openModal = (media) => {
    setSelectedMedia(media);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMedia('');
  };

  if (!mystery) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">{mystery.title}</h1>

      {mystery.image && (
        <div
          onClick={() => openModal(mystery.image.startsWith('http') ? mystery.image : `${API_BASE_URL}${mystery.image}`)}
          style={{
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src={mystery.image.startsWith('http') ? mystery.image : `${API_BASE_URL}${mystery.image}`}
            alt={mystery.title}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

      {renderTags()}
      <p>{mystery.description}</p>

      <div className="comments-section mt-5">
        <h3>Comments</h3>
        <ul className="list-group">
          {comments.map(comment => (
            <li key={comment.id} className="list-group-item">
              <strong>{comment.author?.username || 'Anonymous'}</strong>: {comment.text}
              
              {isLoggedIn && (
                <button
                  className="btn btn-link btn-sm"
                  onClick={() => setReplyCommentId(comment.id)}
                  style={{ marginLeft: '10px', color: '#007bff' }}
                >
                  Reply
                </button>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <ul className="list-group mt-2">
                  {comment.replies.map(reply => (
                    <li key={reply.id} className="list-group-item">
                      <strong>{reply.author?.username || 'Anonymous'}</strong>: {reply.text}
                    </li>
                  ))}
                </ul>
              )}

              {isLoggedIn && replyCommentId === comment.id && (
                <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-2">
                  <textarea
                    className="form-control"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    required
                    style={{ marginTop: '10px', marginBottom: '10px' }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">Submit Reply</button>
                </form>
              )}
            </li>
          ))}
        </ul>

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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        ariaHideApp={false}
        style={{
          content: {
            maxWidth: '80%',
            margin: 'auto',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '10px',
          }
        }}
      >
        <button
          onClick={closeModal}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '20px',
            position: 'absolute',
            top: '10px',
            right: '10px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
        {selectedMedia && (
          <div style={{ textAlign: 'center' }}>
            {selectedMedia.endsWith('.mp4') || selectedMedia.endsWith('.webm') ? (
              <video controls style={{ width: '100%', maxWidth: '100%' }}>
                <source src={selectedMedia} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={selectedMedia} alt="Full Size" style={{ width: '100%', maxWidth: '100%' }} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MysteryDetail;
