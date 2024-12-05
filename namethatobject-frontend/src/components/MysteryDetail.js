import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Modal from "react-modal";

const MysteryDetail = () => {
  const { id } = useParams();
  const [mystery, setMystery] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newCommentTag, setNewCommentTag] = useState("Question"); // Default to "Question"
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  const username = JSON.parse(localStorage.getItem("userData"))?.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mysteryResponse = await axios.get(`${API_BASE_URL}/posts/${id}/`);
        setMystery(mysteryResponse.data);

        const commentsResponse = await axios.get(`${API_BASE_URL}/comments/`);
        const postComments = commentsResponse.data.filter(
          (comment) => comment.post === parseInt(id)
        );

        const commentMap = new Map();
        const topLevelComments = [];

        postComments.forEach(comment => {
          commentMap.set(comment.id, { ...comment, replies: [] });
        });

        postComments.forEach(comment => {
          if (comment.parent) {
            const parentComment = commentMap.get(comment.parent);
            if (parentComment) {
              parentComment.replies.push(commentMap.get(comment.id));
            }
          } else {
            topLevelComments.push(commentMap.get(comment.id));
          }
        });

        setComments(topLevelComments);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleCommentVote = async (commentId, voteType) => {
    if (!isLoggedIn || !token) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/${commentId}/${voteType}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      // Update comments state with new vote counts
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, ...response.data };
          }
          // Check if the voted comment is a reply
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId ? { ...reply, ...response.data } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error(`Error ${voteType}ing comment:`, error);
    }
  };

  const handleMarkSolved = async () => {
    if (!mystery) return;

    const updatedTags = [
      ...(mystery.tags || []),
      {
        name: "Mystery Solved!",
        description: "Mystery is solved",
        wikidata_id: "no_id",
      },
    ];
    try {
      await axios.patch(
        `${API_BASE_URL}/posts/${id}/`,
        { tags: updatedTags },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMystery({ ...mystery, tags: updatedTags });
    } catch (error) {
      console.error("Error marking mystery as solved:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/`,
        { post: id, text: newComment, parent: null, tag: newCommentTag },
        { headers: { Authorization: `Token ${token}` } }
      );

      setComments([...comments, { ...response.data, replies: [] }]);
      setNewComment("");
      setNewCommentTag("Question"); // Reset to default
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };


  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      // Format the data exactly as the API expects
      const replyData = {
        post: id.toString(), // Convert to string as API expects
        text: replyText.trim(),
        parent: parentId.toString() // Convert to string as API expects
      };

      const response = await axios.post(
        `${API_BASE_URL}/comments/`,
        replyData,
        { headers: { Authorization: `Token ${token}` } }
      );

      if (response.data) {
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data]
              };
            }
            return comment;
          })
        );

        setReplyText("");
        setReplyCommentId(null);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      console.error("Error response:", error.response?.data);
      alert("Error posting reply. Please try again.");
    }
  };

  const renderTags = () =>
    mystery?.tags &&
    mystery.tags.length > 0 && (
      <div className="tags-section mt-4">
        <h5 className="mb-3">Tags:</h5>
        <div className="d-flex flex-wrap gap-2">
          {mystery.tags.map((tag, index) => (
            <span
              key={index}
              className="badge"
              style={{
                padding: "8px 12px",
                borderRadius: "20px",
                backgroundColor: tag.name === "Mystery Solved!" ? "var(--accent-green)" : "var(--primary-blue)",
                color: "#fff",
                fontSize: "0.9rem",
                marginBottom: "5px"
              }}
            >
              {tag.name}
              {tag.description && (
                <span className="ms-1 text-light-emphasis">
                  ({tag.description})
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    );

  const openModal = (media) => {
    setSelectedMedia(media);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMedia("");
  };

  if (!mystery) {
    return <p>Loading...</p>;
  }

  const isSolved = mystery.tags?.some((tag) => tag.name === "Mystery Solved!");

  return (
    <div
      className="container mt-4"
      style={{
        border: isSolved ? "4px solid #28a745" : "none",
        borderRadius: "10px",
        padding: "15px",
      }}
    >
      <div className="d-flex align-items-center">
        {/* Voting Section */}
        {isLoggedIn && (
          <div
            className="d-flex flex-column align-items-center me-3"
            style={{
              position: "relative",
              marginLeft: "-50px", // Fixed to leftmost side
            }}
          >
            <span
              className="text-success"
              style={{ fontSize: "24px", cursor: "pointer" }}
              onClick={() => handleVote("upvote")}
            >
              ▲
            </span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                margin: "4px 0",
                color: "var(--primary-text-gray)",
              }}
            >
              {mystery.upvotes - mystery.downvotes}
            </span>
            <span
              className="text-danger"
              style={{ fontSize: "24px", cursor: "pointer" }}
              onClick={() => handleVote("downvote")}
            >
              ▼
            </span>
          </div>
        )}

        {/* Title Section */}
        <div className="title-section">
          <h1 className="text-center">{mystery.title}</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginTop: "10px",
            }}
          >
            {!isSolved && isLoggedIn && (
              <button
                className="btn btn-success"
                style={{ position: "relative" }}
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
              mystery.image.startsWith("http")
                ? mystery.image
                : `${API_BASE_URL}${mystery.image}`
            )
          }
          style={{
            cursor: "pointer",
            overflow: "hidden",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={
              mystery.image.startsWith("http")
                ? mystery.image
                : `${API_BASE_URL}${mystery.image}`
            }
            alt={mystery.title}
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "300px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </div>
      )}

      {/* Media Gallery Section */}
      <div className="media-gallery mb-4">
        <div className="row">
          {/* Image */}
          {mystery.image && (
            <div className="col-md-6 mb-3">
              <div className="media-item h-100">
                <h5 className="mb-3">Image</h5>
                <div
                  onClick={() => openModal(
                    mystery.image.startsWith("http")
                      ? mystery.image
                      : `${API_BASE_URL}${mystery.image}`,
                    'image'
                  )}
                  className="media-container"
                  style={{
                    cursor: "pointer",
                    overflow: "hidden",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                    maxHeight: "300px"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img
                    src={mystery.image.startsWith("http") ? mystery.image : `${API_BASE_URL}${mystery.image}`}
                    alt={mystery.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Video */}
          {mystery.video && (
            <div className="col-md-6 mb-3">
              <div className="media-item h-100">
                <h5 className="mb-3">Video</h5>
                <div
                  className="media-container"
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    maxHeight: "300px"
                  }}
                >
                  <video
                    controls
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      backgroundColor: "#000"
                    }}
                  >
                    <source 
                      src={mystery.video.startsWith("http") ? mystery.video : `${API_BASE_URL}${mystery.video}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          )}

          {/* Audio */}
          {mystery.audio && (
            <div className="col-md-6 mb-3">
              <div className="media-item">
                <h5 className="mb-3">Audio</h5>
                <div
                  className="media-container p-3"
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                >
                  <audio
                    controls
                    style={{ width: "100%" }}
                  >
                    <source 
                      src={mystery.audio.startsWith("http") ? mystery.audio : `${API_BASE_URL}${mystery.audio}`}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mystery Info Section */}
      <div className="mystery-info mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h2 className="mb-3">{mystery.title}</h2>
            <div className="d-flex align-items-center mb-2">
              <Link 
                to={`/profile/${mystery.author?.username}`}
                className="text-decoration-none me-2"
              >
                <img
                  src={
                    mystery.author?.profile_picture
                      ? `${API_BASE_URL}${mystery.author.profile_picture}`
                      : `https://ui-avatars.com/api/?name=${mystery.author?.username}&background=random&size=32`
                  }
                  alt={mystery.author?.username}
                  className="rounded-circle"
                  style={{ width: '32px', height: '32px' }}
                />
                <span className="ms-2 text-primary">{mystery.author?.username}</span>
              </Link>
              <span className="text-muted">
                • {new Date(mystery.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="vote-section">
              <div className="btn-group">
                <button
                  className={`btn ${isLoggedIn ? 'btn-outline-success' : 'btn-secondary'}`}
                  onClick={() => handleVote("upvote")}
                  disabled={!isLoggedIn}
                >
                  ▲ {mystery.upvotes}
                </button>
                <button
                  className={`btn ${isLoggedIn ? 'btn-outline-danger' : 'btn-secondary'}`}
                  onClick={() => handleVote("downvote")}
                  disabled={!isLoggedIn}
                >
                  ▼ {mystery.downvotes}
                </button>
              </div>
              {!isLoggedIn && (
                <small className="d-block text-muted mt-2">
                  Sign in to vote
                </small>
              )}
            </div>
          </div>
        </div>
        
        {renderTags()}
        
        <div className="description-section mt-4">
          <h5 className="mb-3">Description</h5>
          <p className="lead">{mystery.description}</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section mt-5">
        <h3 className="mb-4 border-bottom pb-2">Discussion</h3>
        
        {!isSolved && isLoggedIn && (
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  className="form-control mb-3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  style={{ borderRadius: '10px' }}
                />
                <div className="d-flex justify-content-between align-items-center">
                  <select
                    className="form-select w-auto"
                    value={newCommentTag}
                    onChange={(e) => setNewCommentTag(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="Question">Question</option>
                    <option value="Hint">Hint</option>
                    <option value="Expert Answer">Expert Answer</option>
                  </select>
                  <button type="submit" className="btn btn-primary">
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="card mb-3 shadow-sm fade-in">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Link 
                      to={`/profile/${comment.author?.username}`}
                      className="text-decoration-none"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            comment.author?.profile_picture
                              ? `${API_BASE_URL}${comment.author.profile_picture}`
                              : `https://ui-avatars.com/api/?name=${comment.author?.username}&background=random&size=32`
                          }
                          alt={comment.author?.username}
                          className="rounded-circle me-2"
                          style={{ width: '32px', height: '32px' }}
                        />
                        <h6 className="mb-1">{comment.author?.username}</h6>
                      </div>
                    </Link>
                    <span className={`badge ${
                      comment.tag === "Question" ? "bg-primary" :
                      comment.tag === "Hint" ? "bg-warning" :
                      "bg-success"
                    } mb-2`}>
                      {comment.tag}
                    </span>
                  </div>
                  <small className="text-muted">
                    {new Date(comment.created_at).toLocaleString()}
                  </small>
                </div>
                
                <p className="mb-2">{comment.text}</p>
                
                <div className="d-flex align-items-center gap-3">
                  {isLoggedIn && (
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleCommentVote(comment.id, "upvote")}
                      >
                        ▲ {comment.upvotes || 0}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCommentVote(comment.id, "downvote")}
                      >
                        ▼ {comment.downvotes || 0}
                      </button>
                    </div>
                  )}
                  
                  {!isSolved && isLoggedIn && (
                    <button
                      className="btn btn-sm btn-link"
                      onClick={() => setReplyCommentId(comment.id)}
                    >
                      Reply
                    </button>
                  )}
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ms-4 mt-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="card mb-2">
                        <div className="card-body py-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <Link 
                              to={`/profile/${reply.author?.username}`}
                              className="text-decoration-none"
                            >
                              <div className="d-flex align-items-center">
                                <img
                                  src={
                                    reply.author?.profile_picture
                                      ? `${API_BASE_URL}${reply.author.profile_picture}`
                                      : `https://ui-avatars.com/api/?name=${reply.author?.username}&background=random&size=24`
                                  }
                                  alt={reply.author?.username}
                                  className="rounded-circle me-2"
                                  style={{ width: '24px', height: '24px' }}
                                />
                                <strong>{reply.author?.username}</strong>
                              </div>
                            </Link>
                            <small className="text-muted">
                              {new Date(reply.created_at).toLocaleString()}
                            </small>
                          </div>
                          <p className="mb-2 mt-1">{reply.text}</p>
                          {isLoggedIn && (
                            <div className="d-flex align-items-center mt-2">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleCommentVote(reply.id, "upvote")}
                                >
                                  ▲ {reply.upvotes || 0}
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleCommentVote(reply.id, "downvote")}
                                >
                                  ▼ {reply.downvotes || 0}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isSolved && isLoggedIn && replyCommentId === comment.id && (
                  <div className="mt-3">
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          rows="3"
                          style={{ borderRadius: '10px' }}
                          required
                        />
                      </div>
                      <div className="mt-2">
                        <button type="submit" className="btn btn-primary btn-sm me-2">
                          Submit Reply
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setReplyCommentId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90%',
            maxHeight: '90%',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: 'none'
          }
        }}
      >
        <button
          onClick={closeModal}
          className="btn btn-link position-absolute"
          style={{
            top: '10px',
            right: '10px',
            fontSize: '24px',
            color: '#000',
            textDecoration: 'none'
          }}
        >
          ×
        </button>
        <div className="modal-content text-center">
          {selectedMedia && (
            selectedMedia.endsWith('.mp4') || selectedMedia.endsWith('.webm') ? (
              <video
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              >
                <source src={selectedMedia} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={selectedMedia}
                alt="Full Size"
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              />
            )
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MysteryDetail;
