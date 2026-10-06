import { shortAddress } from '../utils/display';

export default function TransactionBanner({ status, error }) {
  if (!status?.message && !error) return null;
  return (
    <div className={`transaction-banner ${error ? 'is-error' : `is-${status.phase}`}`} role={error ? 'alert' : 'status'}>
      <span className="transaction-icon" aria-hidden="true">{error ? '!' : status.phase === 'confirmed' ? '✓' : '↗'}</span>
      <div>
        <strong>{error ? '操作未完成' : status.message}</strong>
        {error && <span>{error}</span>}
        {status.hash && <span>交易 {shortAddress(status.hash)}</span>}
      </div>
    </div>
  );
}
