import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MysteryDetail from '../components/MysteryDetail';
import axios from 'axios';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

describe('MysteryDetail Component', () => {
  const mockPost = {
    id: 1,
    title: 'Test Mystery',
    description: 'Test Description',
    author: { username: 'testuser' },
    created_at: '2024-03-20T12:00:00Z',
    image_url: 'test.jpg',
    upvotes: 5,
    downvotes: 2,
    comments: []
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockPost });
    localStorage.setItem('token', 'fake-token');
  });

  test('renders mystery title', async () => {
    render(
      <BrowserRouter>
        <MysteryDetail />
      </BrowserRouter>
    );

    const titleElement = await screen.findByText('Test Mystery');
    expect(titleElement).toBeInTheDocument();
  });

  test('renders mystery description', async () => {
    render(
      <BrowserRouter>
        <MysteryDetail />
      </BrowserRouter>
    );

    const descriptionElement = await screen.findByText('Test Description');
    expect(descriptionElement).toBeInTheDocument();
  });

  test('upvote functionality', async () => {
    axios.post.mockResolvedValueOnce({ data: { upvotes: 6, downvotes: 2 } });

    render(
      <BrowserRouter>
        <MysteryDetail />
      </BrowserRouter>
    );

    const upvoteButton = await screen.findByRole('button', { name: /upvote/i });
    fireEvent.click(upvoteButton);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/posts/1/upvote/'),
      {},
      expect.any(Object)
    );
  });

  test('comment submission', async () => {
    const newComment = { text: 'Test comment', tag: 'Question' };
    axios.post.mockResolvedValueOnce({ data: newComment });

    render(
      <BrowserRouter>
        <MysteryDetail />
      </BrowserRouter>
    );

    const commentInput = await screen.findByPlaceholderText(/write a comment/i);
    const submitButton = await screen.findByRole('button', { name: /submit/i });

    fireEvent.change(commentInput, { target: { value: 'Test comment' } });
    fireEvent.click(submitButton);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/comments/'),
      expect.objectContaining(newComment),
      expect.any(Object)
    );
  });
}); 