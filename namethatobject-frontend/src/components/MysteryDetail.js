import React, { useEffect, useState, useMemo } from "react";
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
  const [showEurekaSelection, setShowEurekaSelection] = useState(false);
  const [selectedEurekaComment, setSelectedEurekaComment] = useState(null);

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
    if (!mystery || !isLoggedIn || mystery.author?.username !== username) return;
    setShowEurekaSelection(true);
  };

  const handleSolvedSubmission = async () => {
    if (!selectedEurekaComment) {
      alert("Please select the comment that solved the mystery!");
      return;
    }

    try {
      const updatedTags = [
        ...(mystery.tags || []),
        {
          name: "Mystery Solved!",
          description: "Mystery is solved",
          wikidata_id: "no_id",
        },
      ];

      const response = await axios.patch(
        `${API_BASE_URL}/posts/${id}/`,
        { 
          tags: updatedTags,
          eureka_comment: selectedEurekaComment 
        },
        { 
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data) {
        setMystery(response.data);
        setShowEurekaSelection(false);
        setSelectedEurekaComment(null);
        
        // Refresh the comments to show the updated eureka status
        const commentsResponse = await axios.get(`${API_BASE_URL}/comments/`);
        const postComments = commentsResponse.data.filter(
          (comment) => comment.post === parseInt(id)
        );
        setComments(postComments);
      }
    } catch (error) {
      console.error("Error marking mystery as solved:", error);
      alert("Error updating the post. Please try again.");
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

  const sortedComments = useMemo(() => {
    if (!comments.length) return [];
    return [...comments].sort((a, b) => {
      // Eureka comment always first
      if (mystery.eureka_comment === a.id) return -1;
      if (mystery.eureka_comment === b.id) return 1;
      // Then sort by date
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [comments, mystery?.eureka_comment]);

  if (!mystery) {
    return <p>Loading...</p>;
  }

  const isSolved = mystery.tags?.some((tag) => tag.name === "Mystery Solved!");

  return (
    <div className="container mt-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="voting-section d-flex flex-column align-items-center">
                <button
                  className="btn btn-link p-0"
                  onClick={() => handleVote("upvote")}
                  disabled={!isLoggedIn}
                >
                  <i className="fas fa-arrow-up text-success" style={{ fontSize: '24px' }}></i>
                </button>
                <span className="vote-count my-2" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {mystery.upvotes - mystery.downvotes}
                </span>
                <button
                  className="btn btn-link p-0"
                  onClick={() => handleVote("downvote")}
                  disabled={!isLoggedIn}
                >
                  <i className="fas fa-arrow-down text-danger" style={{ fontSize: '24px' }}></i>
                </button>
              </div>
            </div>

            <div className="col">
              <h1 className="mb-3">{mystery.title}</h1>
              <div className="d-flex align-items-center">
                {mystery.is_anonymous ? (
                  <div className="d-flex align-items-center me-2">
                    <img
                      src={`https://ui-avatars.com/api/?name=Anonymous&background=random&size=32`}
                      alt="Anonymous"
                      className="rounded-circle"
                      style={{ width: '32px', height: '32px' }}
                    />
                    <span className="ms-2 text-muted">Anonymous</span>
                  </div>
                ) : (
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
                )}
                <span className="text-muted">
                  • {new Date(mystery.created_at).toLocaleString()}
                </span>
                {!isSolved && isLoggedIn && mystery.author?.username === username && (
                  <button
                    className="btn btn-success btn-sm ms-auto"
                    onClick={handleMarkSolved}
                  >
                    Mark as Solved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSolved && (
        <div className="solved-banner card bg-success text-white mb-4">
          <div className="card-body d-flex align-items-center">
            <i className="fas fa-check-circle me-3" style={{ fontSize: '24px' }}></i>
            <div>
              <h5 className="mb-0">Mystery Solved!</h5>
              <small>This mystery has been successfully identified</small>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="media-gallery mb-4">
            <div className="row g-4">
              {mystery.image && (
                <div className="col-md-6">
                  <div 
                    className="media-container position-relative"
                    onClick={() => openModal(mystery.image.startsWith("http") ? mystery.image : `${API_BASE_URL}${mystery.image}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={mystery.image.startsWith("http") ? mystery.image : `${API_BASE_URL}${mystery.image}`}
                      alt={mystery.title}
                      className="rounded w-100"
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                    <div className="overlay-hover d-flex align-items-center justify-content-center">
                      <i className="fas fa-search-plus text-white" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              )}
              {mystery.video && (
                <div className="col-md-6">
                  <div className="media-container">
                    <video
                      controls
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                        backgroundColor: "#000",
                        borderRadius: "12px"
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
              )}
              {mystery.audio && (
                <div className="col-md-6">
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

          {renderTags()}

          <div className="description-section mt-4">
            <h5 className="mb-3">Description</h5>
            <p className="lead">{mystery.description}</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEurekaSelection}
        onRequestClose={() => setShowEurekaSelection(false)}
        contentLabel="Select Eureka Comment"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            padding: '0',
            border: 'none',
            borderRadius: '12px',
            backgroundColor: 'white'
          }
        }}
      >
        <div className="modal-header bg-success text-white p-4">
          <h5 className="mb-0">Select the Comment that Solved the Mystery</h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={() => setShowEurekaSelection(false)}
          ></button>
        </div>
        <div className="modal-body p-4">
          <p className="text-muted mb-4">
            Choose the comment that provided the correct answer to your mystery.
            This comment will be marked as the "Eureka Comment"!
          </p>
          
          <div className="comments-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {sortedComments.map((comment) => (
              <div 
                key={comment.id} 
                className={`card mb-2 cursor-pointer ${
                  selectedEurekaComment === comment.id ? 'border-success shadow' : ''
                }`}
                onClick={() => setSelectedEurekaComment(comment.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          comment.author?.profile_picture
                            ? `${API_BASE_URL}${comment.author.profile_picture}`
                            : `https://ui-avatars.com/api/?name=${comment.author?.username}&background=random&size=24`
                        }
                        alt={comment.author?.username}
                        className="rounded-circle me-2"
                        style={{ width: '24px', height: '24px' }}
                      />
                      <strong>{comment.author?.username}</strong>
                    </div>
                    <small className="text-muted">
                      {new Date(comment.created_at).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-1 mt-2">{comment.text}</p>
                  {selectedEurekaComment === comment.id && (
                    <div className="text-success mt-2">
                      <i className="fas fa-check-circle"></i> Selected as Eureka Comment
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowEurekaSelection(false);
                setSelectedEurekaComment(null);
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-success"
              onClick={handleSolvedSubmission}
              disabled={!selectedEurekaComment}
            >
              Mark as Solved
            </button>
          </div>
        </div>
      </Modal>

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
          {sortedComments.map((comment) => (
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
                    {mystery.eureka_comment === comment.id && (
                      <div className="eureka-comment-banner bg-success text-white p-3 rounded mt-2 mb-3">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-lightbulb me-2" style={{ fontSize: '20px' }}></i>
                          <div>
                            <strong className="d-block">Eureka Comment!</strong>
                            <small>This comment solved the mystery</small>
                          </div>
                        </div>
                      </div>
                    )}
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

      <style>
        {`
          .cursor-pointer {
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .cursor-pointer:hover {
            transform: translateY(-2px);
          }

          .eureka-comment-banner {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
            animation: glow 2s infinite alternate;
          }

          @keyframes glow {
            from {
              box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
            }
            to {
              box-shadow: 0 2px 12px rgba(40, 167, 69, 0.6);
            }
          }

          .comment-with-eureka {
            border-left: 4px solid #28a745;
            background-color: rgba(40, 167, 69, 0.05);
          }

          .card.border-success {
            border-width: 2px !important;
          }

          .modal-body {
            scrollbar-width: thin;
            scrollbar-color: rgba(0,0,0,0.2) transparent;
          }

          .modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .modal-body::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 3px;
          }

          .media-container {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }

          .overlay-hover {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            opacity: 0;
            transition: opacity 0.3s;
          }

          .media-container:hover .overlay-hover {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default MysteryDetail;
