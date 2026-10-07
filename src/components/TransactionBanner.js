import { shortAddress } from '../utils/display';
import { transactionUrl } from '../config/platform';

export default function TransactionBanner({ status, error }) {
  if (!status?.message && !error) return null;
  const explorerUrl = transactionUrl(status?.hash);
  return (
    <div className={`transaction-banner ${error ? 'is-error' : `is-${status.phase}`}`} role={error ? 'alert' : 'status'}>
      <span className="transaction-icon" aria-hidden="true">{error ? '!' : status.phase === 'confirmed' ? '✓' : '↗'}</span>
      <div>
        <strong>{error ? '操作未完成' : status.message}</strong>
        {error && <span>{error}</span>}
        {status.hash && (explorerUrl
          ? <a href={explorerUrl} target="_blank" rel="noreferrer">在區塊瀏覽器查看 {shortAddress(status.hash)}</a>
          : <span>交易 {shortAddress(status.hash)}</span>)}
      </div>
    </div>
  );
}
