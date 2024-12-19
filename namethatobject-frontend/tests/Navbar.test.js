import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  const mockSetSearchTerm = jest.fn();

  beforeEach(() => {
    localStorage.clear();
  });

  test('renders navigation links when logged out', () => {
    render(
      <BrowserRouter>
        <Navbar searchTerm="" setSearchTerm={mockSetSearchTerm} />
      </BrowserRouter>
    );

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  test('renders user menu when logged in', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('username', 'testuser');

    render(
      <BrowserRouter>
        <Navbar searchTerm="" setSearchTerm={mockSetSearchTerm} />
      </BrowserRouter>
    );

    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/post mystery/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  test('search functionality', async () => {
    render(
      <BrowserRouter>
        <Navbar searchTerm="" setSearchTerm={mockSetSearchTerm} />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(mockSetSearchTerm).toHaveBeenCalledWith('test search');
    });
  });

  test('logout functionality', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('username', 'testuser');

    render(
      <BrowserRouter>
        <Navbar searchTerm="" setSearchTerm={mockSetSearchTerm} />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  test('logo navigation', () => {
    const { container } = render(
      <BrowserRouter>
        <Navbar searchTerm="" setSearchTerm={mockSetSearchTerm} />
      </BrowserRouter>
    );

    const logoLink = screen.getByRole('link', { name: /logo/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });
}); 