import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

const Profile = () => {
  const { username: profileUsername } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    profession: '',
    profile_picture: null
  });
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [rank, setRank] = useState('');
  const [points, setPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [visiblePosts, setVisiblePosts] = useState(5);
  const [visibleComments, setVisibleComments] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const navigate = useNavigate();

  const loggedInUsername = JSON.parse(localStorage.getItem('userData'))?.username;
  const isOwnProfile = !profileUsername || profileUsername === loggedInUsername;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [profileUsername, token, loggedInUsername]);

  const badgeDescriptions = {
    first_post: 'Awarded for creating the first post.',
    commenter: 'Awarded for the first 10 comments.',
    upvoted_post: 'Earned when a post gets 10+ upvotes.',
    top_contributor: 'Earned for reaching 1000 points.',
    helper: 'Earned for answering 10+ questions marked as "Expert Answer."',
    anonymous_advocate: 'Making high-quality anonymous posts (10+ upvotes).',
  };

  if (!token) {
    return (
      <div className="container mt-5">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="fas fa-lock mb-3" style={{ fontSize: '48px', color: 'var(--primary-blue)' }}></i>
            <h3 className="mb-3">Login Required</h3>
            <p className="text-muted mb-4">
              You need to be logged in to view user profiles.
            </p>
            <Link to="/signin" className="btn btn-primary">
              Sign In
            </Link>
            <div className="mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile data
      const endpoint = profileUsername 
        ? `${API_BASE_URL}/user/profile/${profileUsername}/`
        : `${API_BASE_URL}/user/profile/`;
      
      const profileResponse = await axios.get(endpoint, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfileData(profileResponse.data);

      // Fetch posts
      const postsResponse = await axios.get(`${API_BASE_URL}/posts/`);
      const userSpecificPosts = postsResponse.data
        .filter(post => 
          post.author?.username === (profileUsername || loggedInUsername) && 
          !post.is_anonymous
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setUserPosts(userSpecificPosts);

      // Fetch comments
      const commentsResponse = await axios.get(`${API_BASE_URL}/comments/`);
      const userSpecificComments = commentsResponse.data
        .filter(comment => comment.author?.username === (profileUsername || loggedInUsername))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setUserComments(userSpecificComments);

      const calculatedPoints = calculatePoints(userSpecificPosts, userSpecificComments);
      setPoints(calculatedPoints);
      setRank(calculateRank(calculatedPoints));
      setEarnedBadges(calculateBadges(userSpecificPosts, userSpecificComments, calculatedPoints));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        profile_picture: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    formData.append('bio', profileData.bio);
    formData.append('profession', profileData.profession);
    if (profileData.profile_picture instanceof File) {
      formData.append('profile_picture', profileData.profile_picture);
    }

    try {
      await axios.patch(`${API_BASE_URL}/user/profile/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsEditing(false);
      fetchAllData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const calculateRank = (totalPoints) => {
    if (totalPoints >= 1000) return 'God Like';
    if (totalPoints >= 750) return 'Master';
    if (totalPoints >= 500) return 'Expert';
    if (totalPoints >= 250) return 'Contributor';
    if (totalPoints >= 100) return 'Explorer';
    return 'Beginner';
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

  const handleShowBadge = (badge) => setSelectedBadge(badge);
  const handleCloseModal = () => setSelectedBadge(null);
  const handleLoadMorePosts = () => setVisiblePosts(prev => prev + 5);
  const handleLoadMoreComments = () => setVisibleComments(prev => prev + 5);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== profileData.username) {
      alert("Please enter your username correctly to confirm deletion");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/user/delete-account/`, {
        headers: { Authorization: `Token ${token}` }
      });

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');

      // Show success message and redirect
      alert('Your account has been successfully deleted');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="profile-header mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row align-items-center">
              {/* Profile Picture Column */}
              <div className="col-md-3 text-center">
                {isEditing ? (
                  <div className="position-relative">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile Preview"
                        className="rounded-circle shadow"
                        style={{ width: '128px', height: '128px', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={profileData.profile_picture_url || `https://ui-avatars.com/api/?name=${profileData.username}&background=random&size=128`}
                        alt="Profile"
                        className="rounded-circle shadow"
                        style={{ width: '128px', height: '128px', objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('Profile picture failed to load:', profileData.profile_picture_url);
                          e.target.src = `https://ui-avatars.com/api/?name=${profileData.username}&background=random&size=128`;
                        }}
                      />
                    )}
                    <label 
                      htmlFor="profile-picture-input" 
                      className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fas fa-camera"></i>
                    </label>
                    <input
                      id="profile-picture-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                ) : (
                  <img
                    src={profileData.profile_picture_url || `https://ui-avatars.com/api/?name=${profileData.username}&background=random&size=128`}
                    alt="Profile"
                    className="rounded-circle shadow"
                    style={{ width: '128px', height: '128px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Profile picture failed to load:', profileData.profile_picture_url);
                      e.target.src = `https://ui-avatars.com/api/?name=${profileData.username}&background=random&size=128`;
                    }}
                  />
                )}
              </div>

              {/* Profile Info Column */}
              <div className="col-md-5">
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Bio</label>
                      <textarea
                        name="bio"
                        className="form-control"
                        value={profileData.bio || ''}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Profession</label>
                      <input
                        type="text"
                        name="profession"
                        className="form-control"
                        value={profileData.profession || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <button type="submit" className="btn btn-primary me-2">Save</button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info">
                    <h3 className="mb-2">{profileData.username}</h3>
                    {profileData.profession && (
                      <p className="text-muted mb-2">{profileData.profession}</p>
                    )}
                    {profileData.bio && (
                      <p className="mb-3">{profileData.bio}</p>
                    )}
                    {isOwnProfile && (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Rank & Points Column */}
              <div className="col-md-4">
                <div className="rank-card p-3 rounded-lg" 
                  style={{ 
                    background: 'var(--primary-blue)',
                    color: 'white'
                  }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Current Rank</h5>
                    <span className="badge bg-warning text-dark px-3 py-2">
                      {rank}
                    </span>
                  </div>
                  <div className="progress mb-3" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ 
                        width: `${Math.min((points / 1000) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-light-50">Total Points</small>
                      <h4 className="mb-0">{points}</h4>
                    </div>
                    <div className="text-end">
                      <small className="text-light-50">Next Rank At</small>
                      <h4 className="mb-0">
                        {points >= 1000 ? 'MAX' : 
                         points >= 750 ? '1000' :
                         points >= 500 ? '750' :
                         points >= 250 ? '500' :
                         points >= 100 ? '250' : '100'}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="badges-section mt-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Earned Badges</h5>
              <div className="badges-container d-flex flex-wrap gap-4 justify-content-center">
                {earnedBadges.length > 0 ? (
                  earnedBadges.map((badge, index) => (
                    <div 
                      key={index}
                      className="badge-item"
                      onClick={() => handleShowBadge(badge)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="badge-wrapper p-2 rounded-circle bg-light shadow-sm">
                        <img
                          src={`${API_BASE_URL}/media/badges/${badge}.png`}
                          alt={badge}
                          className="badge-image"
                          style={{
                            width: '80px',
                            height: '80px',
                            transition: 'transform 0.2s',
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                      <small className="d-block mt-2 text-muted">
                        {badge.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="text-muted p-4 bg-light rounded">
                    <i className="fas fa-award mb-2" style={{ fontSize: '2rem' }}></i>
                    <p className="mb-0">No badges earned yet. Keep contributing!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Posts</h5>
            </div>
            <div className="card-body">
              {userPosts.slice(0, visiblePosts).map(post => (
                <div key={post.id} className="mb-3 border-bottom pb-3">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={
                        post.author?.profile_picture
                          ? post.author.profile_picture.startsWith('http')
                            ? post.author.profile_picture
                            : `https://res.cloudinary.com/dbrvvzoys/image/upload/${post.author.profile_picture}`
                          : `https://ui-avatars.com/api/?name=${post.author?.username}&background=random&size=32`
                      }
                      alt={post.author?.username}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0">
                        <Link to={`/mystery/${post.id}`} className="text-decoration-none">
                          {post.title}
                        </Link>
                      </h6>
                      <small className="text-muted">
                        Posted on {new Date(post.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <p className="mb-1">{post.description.substring(0, 100)}...</p>
                  <div>
                    <span className="badge bg-success me-2">↑ {post.upvotes}</span>
                    <span className="badge bg-danger">↓ {post.downvotes}</span>
                  </div>
                </div>
              ))}
              {userPosts.length > visiblePosts && (
                <button 
                  onClick={handleLoadMorePosts}
                  className="btn btn-outline-primary w-100 mt-3"
                >
                  Show More Posts
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Comments</h5>
            </div>
            <div className="card-body">
              {userComments.slice(0, visibleComments).map(comment => (
                <div key={comment.id} className="mb-3 border-bottom pb-3">
                  <div className="d-flex align-items-start">
                    <img
                      src={
                        comment.author?.profile_picture
                          ? comment.author.profile_picture.startsWith('http')
                            ? comment.author.profile_picture
                            : `https://res.cloudinary.com/dbrvvzoys/image/upload/${comment.author.profile_picture}`
                          : `https://ui-avatars.com/api/?name=${comment.author?.username}&background=random&size=32`
                      }
                      alt={comment.author?.username}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                    <div>
                      <p className="mb-1">{comment.text}</p>
                      <div className="d-flex align-items-center">
                        <small className="text-muted me-2">
                          {new Date(comment.created_at).toLocaleString()}
                        </small>
                        <Link 
                          to={`/mystery/${comment.post}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Post
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {userComments.length > visibleComments && (
                <button 
                  onClick={handleLoadMoreComments}
                  className="btn btn-outline-primary w-100 mt-3"
                >
                  Show More Comments
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedBadge}
        onRequestClose={handleCloseModal}
        contentLabel="Badge Details"
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
            maxWidth: '500px',
            width: '90%',
            padding: '2rem',
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        {selectedBadge && (
          <div className="text-center">
            <div className="badge-display mb-4">
              <img
                src={`${API_BASE_URL}/media/badges/${selectedBadge}.png`}
                alt={selectedBadge}
                style={{ width: '120px', height: '120px' }}
              />
            </div>
            <h4 className="mb-3">
              {selectedBadge.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h4>
            <p className="text-muted mb-4">{badgeDescriptions[selectedBadge]}</p>
            <button 
              onClick={handleCloseModal} 
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {isOwnProfile && (
        <>
          <div className="mt-4 pt-4 border-top">
            <h5 className="text-danger mb-3">Danger Zone</h5>
            <button 
              className="btn btn-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>

          <Modal
            isOpen={showDeleteModal}
            onRequestClose={() => setShowDeleteModal(false)}
            contentLabel="Delete Account Confirmation"
            className="modal-dialog modal-dialog-centered"
            overlayClassName="modal-backdrop"
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
                border: 'none',
                background: '#fff',
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '500px',
                width: '90%'
              }
            }}
          >
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Delete Account</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong>
                  <ul className="mb-0">
                    <li>This action cannot be undone</li>
                    <li>Posts with comments will be anonymized</li>
                    <li>Posts without comments will be deleted</li>
                    <li>All your comments will be anonymized</li>
                  </ul>
                </div>
                <p>Please type your username <strong>{profileData.username}</strong> to confirm:</p>
                <input
                  type="text"
                  className="form-control"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== profileData.username}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Profile;
