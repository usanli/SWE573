import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(ui, { wrapper: BrowserRouter }),
  };
};

export const mockLocalStorage = () => {
  const storage = {};
  return {
    getItem: (key) => storage[key],
    setItem: (key, value) => storage[key] = value,
    removeItem: (key) => delete storage[key],
    clear: () => Object.keys(storage).forEach(key => delete storage[key])
  };
}; 