// src/components/PostList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/posts/`)
      .then(response => setPosts(response.data))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.length > 0 ? (
          posts.map(post => (
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.description}</p>

              {/* Display Image with URL Check */}
              {post.image && (
                <img 
                  src={post.image.startsWith('http') ? post.image : `${API_BASE_URL}${post.image}`} 
                  alt={post.title} 
                />
              )}

              {/* Display Video with URL Check */}
              {post.video && (
                <video controls>
                  <source src={post.video.startsWith('http') ? post.video : `${API_BASE_URL}${post.video}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Display Audio with URL Check */}
              {post.audio && (
                <audio controls>
                  <source src={post.audio.startsWith('http') ? post.audio : `${API_BASE_URL}${post.audio}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </li>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </ul>
    </div>
  );
};

export default PostList;
