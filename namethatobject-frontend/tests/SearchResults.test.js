import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchResults from '../components/SearchResults';
import axios from 'axios';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams('q=test')],
}));

describe('SearchResults Component', () => {
  const mockResults = [
    {
      id: 1,
      title: 'Test Result',
      description: 'Test Description',
      author: { username: 'testuser' },
      created_at: '2024-03-20T12:00:00Z',
    }
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockResults });
  });

  test('renders search result title', async () => {
    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Result')).toBeInTheDocument();
    });
  });

  test('renders search result details', async () => {
    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  test('displays no results message', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  test('displays loading state', () => {
    render(
      <BrowserRouter>
        <SearchResults />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
}); 