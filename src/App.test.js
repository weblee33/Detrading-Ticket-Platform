import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the demo marketplace without requesting a wallet automatically', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /每一張票/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '連接 MetaMask' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: '平台功能' })).toBeInTheDocument();
});
