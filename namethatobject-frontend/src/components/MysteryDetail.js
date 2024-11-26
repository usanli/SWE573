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
  const username = JSON.parse(localStorage.getItem('userData'))?.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mysteryResponse = await axios.get(`${API_BASE_URL}/posts/${id}/`);
        setMystery(mysteryResponse.data);

        const commentsResponse = await axios.get(`${API_BASE_URL}/comments/`);
        const postComments = commentsResponse.data.filter(
          (comment) => comment.post === parseInt(id)
        );

        const structuredComments = postComments.reduce((acc, comment) => {
          if (!comment.parent) {
            acc.push({ ...comment, replies: [] });
          } else {
            const parentComment = acc.find((c) => c.id === comment.parent);
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

  const handleVote = async (voteType) => {
    if (!isLoggedIn || !token) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${id}/${voteType}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setMystery({ ...mystery, ...response.data });
    } catch (error) {
      console.error(`Error submitting ${voteType}:`, error);
    }
  };

  const handleMarkSolved = async () => {
    if (!mystery) return;

    const updatedTags = [
      ...(mystery.tags || []),
      { name: 'Mystery Solved!', description: 'Mystery is solved', wikidata_id: 'no_id' },
    ];
    try {
      await axios.patch(
        `${API_BASE_URL}/posts/${id}/`,
        { tags: updatedTags },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMystery({ ...mystery, tags: updatedTags });
    } catch (error) {
      console.error('Error marking mystery as solved:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/`,
        { post: id, text: newComment, parent: null },
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

      const updatedComments = comments.map((comment) => {
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

  const renderTags = () =>
    mystery?.tags && mystery.tags.length > 0 && (
      <div style={{ marginTop: '20px' }}>
        <h5>Tags:</h5>
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {mystery.tags.map((tag, index) => (
            <li key={index} style={{ display: 'inline', marginRight: '10px' }}>
              <span
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  backgroundColor: tag.name === 'Mystery Solved!' ? '#28a745' : '#6c757d',
                  color: '#fff',
                }}
              >
                {tag.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
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

  const isSolved = mystery.tags?.some((tag) => tag.name === 'Mystery Solved!');

  return (
    <div
      className="container mt-4"
      style={{
        border: isSolved ? '4px solid #28a745' : 'none',
        borderRadius: '10px',
        padding: '15px',
      }}
    >
      <div className="d-flex align-items-center">
        {/* Voting Section */}
        {isLoggedIn && (
          <div
            className="d-flex flex-column align-items-center me-3"
            style={{
              position: 'relative',
              marginLeft: '-50px', // Fixed to leftmost side
            }}
          >
            <span
              className="text-success"
              style={{ fontSize: '24px', cursor: 'pointer' }}
              onClick={() => handleVote('upvote')}
            >
              ▲
            </span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '4px 0',
                color: 'var(--primary-text-gray)',
              }}
            >
              {mystery.upvotes - mystery.downvotes}
            </span>
            <span
              className="text-danger"
              style={{ fontSize: '24px', cursor: 'pointer' }}
              onClick={() => handleVote('downvote')}
            >
              ▼
            </span>
          </div>
        )}

        {/* Title Section */}
        <div className="title-section">
          <h1 className="text-center">{mystery.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
            {!isSolved && isLoggedIn && (
              <button
                className="btn btn-success"
                style={{ position: 'relative' }}
                onClick={handleMarkSolved}
              >
                Mystery Solved!
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Media Section */}
      {mystery.image && (
        <div
          onClick={() =>
            openModal(
              mystery.image.startsWith('http')
                ? mystery.image
                : `${API_BASE_URL}${mystery.image}`
            )
          }
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
            src={
              mystery.image.startsWith('http')
                ? mystery.image
                : `${API_BASE_URL}${mystery.image}`
            }
            alt={mystery.title}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        </div>
      )}

      {renderTags()}
      <p>{mystery.description}</p>

      {/* Comments Section */}
      <div className="comments-section mt-5">
        <h3>Comments</h3>
        <ul className="list-group">
          {comments.map((comment) => (
            <li key={comment.id} className="list-group-item">
              <strong>{comment.author?.username || 'Anonymous'}</strong>: {comment.text}
              <p style={{ fontSize: '0.9rem', color: '#888' }}>
                Posted on: {new Date(comment.created_at).toLocaleString()}
              </p>
              {!isSolved && isLoggedIn && (
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
                  {comment.replies.map((reply) => (
                    <li key={reply.id} className="list-group-item">
                      <strong>{reply.author?.username || 'Anonymous'}</strong>: {reply.text}
                      <p style={{ fontSize: '0.9rem', color: '#888' }}>
                        Posted on: {new Date(reply.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {!isSolved && isLoggedIn && replyCommentId === comment.id && (
                <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-2">
                  <textarea
                    className="form-control"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    required
                    style={{ marginTop: '10px', marginBottom: '10px' }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    Submit Reply
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>

        {!isSolved && isLoggedIn ? (
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
            <button type="submit" className="btn btn-primary mt-2">
              Submit Comment
            </button>
          </form>
        ) : (
          isSolved && <p className="mt-4 text-center text-danger">Comments are disabled for solved mysteries.</p>
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
          },
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
            cursor: 'pointer',
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
