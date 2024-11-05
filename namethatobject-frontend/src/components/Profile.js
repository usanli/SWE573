// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [error, setError] = useState(null);
  const [postLimit, setPostLimit] = useState(5);
  const [commentLimit, setCommentLimit] = useState(5);

  const token = localStorage.getItem('token');
  const username = JSON.parse(localStorage.getItem('userData'))?.username;

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
          .filter((post) =>
            post.comments.some((comment) => comment.author.username === username) || post.comments.length === 0
          )
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

  const handleShowMorePosts = () => setPostLimit(postLimit + 5);
  const handleShowMoreComments = () => setCommentLimit(commentLimit + 5);

  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">User Profile</h2>

      {userData ? (
        <div className="card mb-4 shadow-sm">
          <div className="card-body text-center">
            <h4 className="card-title">{userData.username}</h4>
            <p className="card-text text-muted">{userData.email}</p>
          </div>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}

      <div className="row">
        <div className="col-md-6">
          <h3>My Recent Posts</h3>
          {userPosts.length > 0 ? (
            <div>
              {userPosts.slice(0, postLimit).map((post) => (
                <div key={post.id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      <Link to={`/mystery/${post.id}`} className="text-decoration-none">
                        {post.title}
                      </Link>
                    </h5>
                    <p className="card-text">{post.description}</p>
                    <p className="card-text">
                      <small className="text-muted">Posted on: {new Date(post.created_at).toLocaleString()}</small>
                    </p>
                  </div>
                </div>
              ))}
              {postLimit < userPosts.length && (
                <button onClick={handleShowMorePosts} className="btn btn-outline-primary w-100 mt-2">
                  Show More Posts
                </button>
              )}
            </div>
          ) : (
            <p>No posts found.</p>
          )}
        </div>

        <div className="col-md-6">
          <h3>My Recent Comments</h3>
          {userComments.length > 0 ? (
            <div>
              {userComments.slice(0, commentLimit).map((comment) => (
                <div key={comment.id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <p className="card-text">{comment.text}</p>
                    <p className="card-text">
                      <small className="text-muted">
                        Commented on: <Link to={`/mystery/${comment.post}`} className="text-decoration-none">View Post</Link> - {new Date(comment.created_at).toLocaleString()}
                      </small>
                    </p>
                  </div>
                </div>
              ))}
              {commentLimit < userComments.length && (
                <button onClick={handleShowMoreComments} className="btn btn-outline-primary w-100 mt-2">
                  Show More Comments
                </button>
              )}
            </div>
          ) : (
            <p>No comments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
