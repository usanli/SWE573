import { useNavigate } from 'react-router-dom';

export const handleAxiosError = (error, navigate) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/signin', { 
          state: { message: 'Please sign in to continue.' } 
        });
        break;
      case 403:
        // Forbidden
        navigate('/error', { 
          state: { error: 'You don\'t have permission to access this resource.' } 
        });
        break;
      case 404:
        navigate('/error', { 
          state: { error: 'The requested resource was not found.' } 
        });
        break;
      case 500:
        navigate('/error', { 
          state: { error: 'Internal server error. Please try again later.' } 
        });
        break;
      default:
        // Server Error
        navigate('/error', { 
          state: { error: 'Something went wrong. Please try again later.' } 
        });
    }
  } else if (error.request) {
    // Network Error
    navigate('/error', { 
      state: { error: 'Unable to connect to the server. Please check your internet connection.' } 
    });
  } else {
    // Other Errors
    navigate('/error', { 
      state: { error: 'An unexpected error occurred.' } 
    });
  }
}; 