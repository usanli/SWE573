import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../components/Profile';
import axios from 'axios';

jest.mock('axios');

describe('Profile Component', () => {
  const mockUser = {
    username: 'testuser',
    profile: {
      bio: 'Test bio',
      profession: 'Test profession',
      profile_picture_url: 'test.jpg'
    }
  };

  const mockPosts = [
    {
      id: 1,
      title: 'Test Post',
      description: 'Test Description',
      created_at: '2024-03-20T12:00:00Z'
    }
  ];

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('user/profile')) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes('posts')) {
        return Promise.resolve({ data: mockPosts });
      }
      return Promise.reject(new Error('not found'));
    });
    localStorage.setItem('token', 'fake-token');
  });

  test('renders username', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    const usernameElement = await screen.findByText('testuser');
    expect(usernameElement).toBeInTheDocument();
  });

  test('renders bio and profession', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    const bioElement = await screen.findByText('Test bio');
    expect(bioElement).toBeInTheDocument();

    const professionElement = await screen.findByText('Test profession');
    expect(professionElement).toBeInTheDocument();
  });

  test('edit profile functionality', async () => {
    axios.patch.mockResolvedValueOnce({ 
      data: {
        ...mockUser.profile,
        bio: 'Updated bio'
      }
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    const editButton = await screen.findByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);

    const bioInput = screen.getByLabelText(/bio/i);
    fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(axios.patch).toHaveBeenCalledWith(
      expect.stringContaining('/user/profile/'),
      expect.objectContaining({ bio: 'Updated bio' }),
      expect.any(Object)
    );
  });

  test('displays user posts', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    const postTitle = await screen.findByText('Test Post');
    expect(postTitle).toBeInTheDocument();

    const postDescription = await screen.findByText('Test Description');
    expect(postDescription).toBeInTheDocument();
  });
}); 