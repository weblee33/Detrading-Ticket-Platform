import { useEffect, useId, useRef, useState } from 'react';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function cameraErrorMessage(error) {
  const name = error?.name || '';
  if (name === 'NotAllowedError') return '相機權限遭拒，請允許瀏覽器使用相機後再試一次';
  if (name === 'NotFoundError') return '找不到可使用的相機，請改用圖片上傳或貼上票證資料';
  if (name === 'NotReadableError') return '相機正被其他程式使用，請關閉其他相機程式後再試';
  return error?.message || (typeof error === 'string' ? error : '') || '無法啟動相機，請改用圖片上傳或貼上票證資料';
}

export default function QrScanner({ onScan }) {
  const reactId = useId();
  const readerId = `ticket-qr-reader-${reactId.replace(/:/g, '')}`;
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('尚未啟動相機');
  const [error, setError] = useState('');

  const getScanner = async () => {
    if (!scannerRef.current) {
      const { Html5Qrcode } = await import('html5-qrcode');
      scannerRef.current = new Html5Qrcode(readerId, false);
    }
    return scannerRef.current;
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    try {
      if (scanner?.isScanning) await scanner.stop();
    } catch (stopError) {
      if (mountedRef.current) setError(cameraErrorMessage(stopError));
    } finally {
      if (mountedRef.current) {
        setCameraActive(false);
        setBusy(false);
        setMessage('相機已停止');
      }
    }
  };

  useEffect(() => () => {
    mountedRef.current = false;
    const scanner = scannerRef.current;
    if (scanner?.isScanning) scanner.stop().catch(() => {});
  }, []);

  const acceptScan = async decodedText => {
    try {
      onScan(decodedText);
      setError('');
      setMessage('已讀取 QR Code，請核對右側票證摘要');
      if (scannerRef.current?.isScanning) await stopCamera();
    } catch (scanError) {
      setError(scanError.message);
    }
  };

  const startCamera = async () => {
    setBusy(true);
    setError('');
    setMessage('正在請求相機權限…');
    try {
      const scanner = await getScanner();
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        acceptScan,
        () => {}
      );
      if (mountedRef.current) {
        setCameraActive(true);
        setBusy(false);
        setMessage('請將票證 QR Code 對準框內');
      }
    } catch (cameraError) {
      if (mountedRef.current) {
        setCameraActive(false);
        setBusy(false);
        setError(cameraErrorMessage(cameraError));
        setMessage('相機未啟動');
      }
    }
  };

  const scanImage = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('圖片不可超過 10 MB');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('正在辨識圖片…');
    try {
      if (scannerRef.current?.isScanning) await stopCamera();
      const scanner = await getScanner();
      const decodedText = await scanner.scanFile(file, true);
      await acceptScan(decodedText);
    } catch (scanError) {
      setError(scanError?.message || '圖片中找不到可辨識的 QR Code');
      setMessage('圖片辨識失敗');
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  };

  return (
    <div className="qr-scanner">
      <div id={readerId} className={`qr-reader ${cameraActive ? 'is-active' : ''}`} aria-label="QR Code 相機預覽" />
      <div className="scanner-status" aria-live="polite"><span className={cameraActive ? 'status-live' : ''} />{message}</div>
      <div className="scanner-actions">
        <button className="button button-primary" type="button" disabled={busy} onClick={cameraActive ? stopCamera : startCamera}>
          {busy ? '處理中…' : cameraActive ? '停止相機' : '啟動相機掃描'}
        </button>
        <label className="button button-quiet file-button">
          從圖片讀取
          <input type="file" accept="image/*" capture="environment" disabled={busy} onChange={scanImage} />
        </label>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <small className="privacy-note">相機畫面只在此裝置辨識，不會上傳伺服器；掃描完成會自動停止鏡頭。</small>
    </div>
  );
}
