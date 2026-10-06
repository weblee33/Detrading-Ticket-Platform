import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QrScanner from './QrScanner';

jest.mock('html5-qrcode', () => {
  const scanner = {
    start: jest.fn(),
    stop: jest.fn(),
    scanFile: jest.fn(),
    isScanning: false
  };
  class MockHtml5Qrcode {
    constructor() { return scanner; }
  }
  return { Html5Qrcode: MockHtml5Qrcode, mockScanner: scanner };
});

const { mockScanner: scanner } = require('html5-qrcode');

beforeEach(() => {
  jest.clearAllMocks();
  scanner.isScanning = false;
  scanner.start.mockResolvedValue(undefined);
  scanner.stop.mockResolvedValue(undefined);
  scanner.scanFile.mockResolvedValue('decoded-pass');
});

test('camera only starts after the user requests it', async () => {
  render(<QrScanner onScan={jest.fn()} />);
  expect(scanner.start).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: '啟動相機掃描' }));

  await waitFor(() => expect(scanner.start).toHaveBeenCalledWith(
    { facingMode: 'environment' },
    expect.objectContaining({ fps: 10 }),
    expect.any(Function),
    expect.any(Function)
  ));
  expect(await screen.findByText('請將票證 QR Code 對準框內')).toBeInTheDocument();
});

test('shows a useful message when camera permission is denied', async () => {
  scanner.start.mockRejectedValueOnce(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
  render(<QrScanner onScan={jest.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: '啟動相機掃描' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('相機權限遭拒');
});

test('rejects a non-image upload without loading the scanner', () => {
  const { container } = render(<QrScanner onScan={jest.fn()} />);
  const input = container.querySelector('input[type="file"]');
  const file = new File(['ticket'], 'ticket.txt', { type: 'text/plain' });

  fireEvent.change(input, { target: { files: [file] } });

  expect(screen.getByRole('alert')).toHaveTextContent('請選擇圖片檔案');
  expect(scanner.scanFile).not.toHaveBeenCalled();
});
