import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [error, setError] = useState(null);
  const [postLimit, setPostLimit] = useState(5);
  const [commentLimit, setCommentLimit] = useState(5);
  const [rank, setRank] = useState('');
  const [points, setPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const token = localStorage.getItem('token');
  const username = JSON.parse(localStorage.getItem('userData'))?.username;

  const badgeDescriptions = {
    first_post: 'Awarded for creating the first post.',
    commenter: 'Awarded for the first 10 comments.',
    upvoted_post: 'Earned when a post gets 10+ upvotes.',
    top_contributor: 'Earned for reaching 1000 points.',
    helper: 'Earned for answering 10+ questions marked as "Expert Answer."',
    anonymous_advocate: 'Making high-quality anonymous posts (10+ upvotes).',
  };

  const calculateRank = (totalPoints) => {
    if (totalPoints >= 1000) {
      return 'God Like';
    } else if (totalPoints >= 750) {
      return 'Master';
    } else if (totalPoints >= 500) {
      return 'Expert';
    } else if (totalPoints >= 250) {
      return 'Contributor';
    } else if (totalPoints >= 100) {
      return 'Explorer';
    } else {
      return 'Beginner';
    }
  };

  const calculatePoints = (posts, comments) => {
    let pointsFromPosts = posts.reduce((sum, post) => sum + post.upvotes, 0);
    let pointsFromComments = comments.reduce((sum, comment) => sum + comment.upvotes, 0);
    let bonusPoints = posts.length * 10 + comments.length * 5;
    return pointsFromPosts + pointsFromComments + bonusPoints;
  };

  const calculateBadges = (posts, comments, points) => {
    const badges = [];
    const upvotedPosts = posts.filter((post) => post.upvotes >= 10).length;
    const expertAnswers = comments.filter((comment) => comment.tag === 'Expert Answer').length;
    const anonymousUpvotedPosts = posts.filter((post) => post.anonymous && post.upvotes >= 10).length;

    if (posts.length > 0) badges.push('first_post');
    if (comments.length >= 10) badges.push('commenter');
    if (upvotedPosts > 0) badges.push('upvoted_post');
    if (points >= 1000) badges.push('top_contributor');
    if (expertAnswers >= 10) badges.push('helper');
    if (anonymousUpvotedPosts > 0) badges.push('anonymous_advocate');

    return badges;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/user/profile/`, {
            headers: { Authorization: `Token ${token}` },
          });
          setUserData(response.data);
        } catch (err) {
          setError('Failed to fetch user data.');
          console.error(err);
        }
      }
    };

    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/`);
        const userSpecificPosts = response.data
          .filter((post) => post.author?.username === username)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setUserPosts(userSpecificPosts);
      } catch (err) {
        setError('Failed to fetch user posts.');
        console.error(err);
      }
    };

    const fetchUserComments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/comments/`);
        const userSpecificComments = response.data
          .filter((comment) => comment.author.username === username)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setUserComments(userSpecificComments);
      } catch (err) {
        setError('Failed to fetch user comments.');
        console.error(err);
      }
    };

    fetchUserData();
    fetchUserPosts();
    fetchUserComments();
  }, [token, username]);

  useEffect(() => {
    if (userPosts.length > 0 || userComments.length > 0) {
      const calculatedPoints = calculatePoints(userPosts, userComments);
      setPoints(calculatedPoints);
      setRank(calculateRank(calculatedPoints));
      setEarnedBadges(calculateBadges(userPosts, userComments, calculatedPoints));
    }
  }, [userPosts, userComments]);

  const handleShowMorePosts = () => setPostLimit(postLimit + 5);
  const handleShowMoreComments = () => setCommentLimit(commentLimit + 5);
  const handleShowBadge = (badge) => setSelectedBadge(badge);
  const handleCloseModal = () => setSelectedBadge(null);

  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="profile-header text-center mb-5">
        <h2 className="display-4 mb-4">User Profile</h2>
        <div className="profile-banner bg-gradient p-4 rounded-lg shadow-lg">
          {userData ? (
            <div className="profile-content">
              <div className="avatar mb-3">
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.username}&background=random&size=128`}
                  alt="Profile"
                  className="rounded-circle shadow"
                  style={{ width: '128px', height: '128px' }}
                />
              </div>
              <h3 className="display-5 mb-2">{userData.username}</h3>
              <p className="lead text-muted mb-3">{userData.email}</p>
              <div className="rank-badge p-3 mb-4 bg-light rounded-pill shadow-sm d-inline-block">
                <h4 className="mb-0">
                  <span className="badge bg-primary me-2">{rank}</span>
                  <small className="text-muted">Points: {points}</small>
                </h4>
              </div>
              
              <div className="badges-section mt-4">
                <h5 className="mb-4">Earned Badges</h5>
                <div className="badges-container d-flex justify-content-center flex-wrap gap-3">
                  {earnedBadges.length > 0 ? (
                    earnedBadges.map((badge, index) => (
                      <div 
                        key={index}
                        className="badge-item"
                        onClick={() => handleShowBadge(badge)}
                      >
                        <img
                          src={`http://localhost:8000/media/badges/${badge}.png`}
                          alt={badge}
                          title={badgeDescriptions[badge]}
                          className="badge-image hover-effect"
                          style={{
                            width: '90px',
                            height: '90px',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No badges earned yet. Keep contributing!</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedBadge}
        onRequestClose={handleCloseModal}
        contentLabel="Badge Modal"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            maxWidth: '500px',
            width: '90%',
            padding: '2rem',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {selectedBadge && (
          <div className="text-center">
            <img
              src={`http://localhost:8000/media/badges/${selectedBadge}.png`}
              alt={selectedBadge}
              className="img-fluid mb-4"
              style={{ maxWidth: '250px' }}
            />
            <h4 className="mb-4">{badgeDescriptions[selectedBadge]}</h4>
            <button onClick={handleCloseModal} className="btn btn-primary">
              Close
            </button>
          </div>
        )}
      </Modal>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="content-section p-4 bg-light rounded-lg shadow-sm">
            <h3 className="border-bottom pb-3 mb-4">My Recent Posts</h3>
            {userPosts.length > 0 ? (
              <div className="posts-container">
                {userPosts.slice(0, postLimit).map((post) => (
                  <div key={post.id} className="card mb-3 hover-effect">
                    <div className="card-body">
                      <h5 className="card-title">
                        <Link to={`/mystery/${post.id}`} className="text-decoration-none text-primary">
                          {post.title}
                        </Link>
                      </h5>
                      <p className="card-text text-muted">{post.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Posted: {new Date(post.created_at).toLocaleDateString()}
                        </small>
                        <span className="badge bg-success">{post.upvotes} upvotes</span>
                      </div>
                    </div>
                  </div>
                ))}
                {postLimit < userPosts.length && (
                  <button onClick={handleShowMorePosts} className="btn btn-outline-primary w-100">
                    Show More Posts
                  </button>
                )}
              </div>
            ) : (
              <p className="text-muted text-center">No posts found. Start sharing your mysteries!</p>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="content-section p-4 bg-light rounded-lg shadow-sm">
            <h3 className="border-bottom pb-3 mb-4">My Recent Comments</h3>
            {userComments.length > 0 ? (
              <div className="comments-container">
                {userComments.slice(0, commentLimit).map((comment) => (
                  <div key={comment.id} className="card mb-3 hover-effect">
                    <div className="card-body">
                      <p className="card-text">{comment.text}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <Link to={`/mystery/${comment.post}`} className="btn btn-sm btn-outline-secondary">
                          View Post
                        </Link>
                        <small className="text-muted">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                {commentLimit < userComments.length && (
                  <button onClick={handleShowMoreComments} className="btn btn-outline-primary w-100">
                    Show More Comments
                  </button>
                )}
              </div>
            ) : (
              <p className="text-muted text-center">No comments found. Join the discussion!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
