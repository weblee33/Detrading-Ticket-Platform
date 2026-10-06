import { shortAddress } from '../utils/display';

export default function WalletBar({ account, role, loading, pending, onConnect, onRefresh }) {
  return (
    <div className="wallet-bar">
      <div className="wallet-identity">
        <span className={`network-dot ${account ? 'online' : ''}`} aria-hidden="true" />
        <div>
          <strong>{role.name}</strong>
          <span>{account ? shortAddress(account) : 'Hardhat Demo Network'}</span>
        </div>
      </div>
      <div className="wallet-actions">
        {account && <button className="button button-quiet" type="button" onClick={onRefresh} disabled={loading || pending}>重新整理</button>}
        <button className="button button-primary" type="button" onClick={onConnect} disabled={pending}>
          {account ? '切換帳號' : '連接 MetaMask'}
        </button>
      </div>
    </div>
  );
}
