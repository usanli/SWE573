import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MysteryList from '../components/MysteryList';
import axios from 'axios';

jest.mock('axios');

describe('MysteryList Component', () => {
  const mockPosts = [
    {
      id: 1,
      title: 'Test Mystery',
      description: 'Test Description',
      author: { username: 'testuser' },
      created_at: '2024-03-20T12:00:00Z',
    },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockPosts });
  });

  test('renders mystery posts', async () => {
    render(
      <BrowserRouter>
        <MysteryList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Mystery')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  test('displays loading state', () => {
    render(
      <BrowserRouter>
        <MysteryList />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
}); 