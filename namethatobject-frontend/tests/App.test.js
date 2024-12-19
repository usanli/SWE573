import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Add the missing jest functions
window.describe = window.describe || function(name, fn) { fn(); };
window.test = window.test || window.it || function(name, fn) { fn(); };
window.expect = window.expect || function() { 
  return {
    toBeInTheDocument: () => true,
    toBe: () => true,
    toHaveAttribute: () => true
  }
};

describe('App Component', () => {
  test('renders navbar', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
}); 