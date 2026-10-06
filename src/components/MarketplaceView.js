import { useState } from 'react';
import EmptyState from './EmptyState';
import TicketArtwork from './TicketArtwork';
import { formatWeiAsEth, shortAddress } from '../utils/display';

export default function MarketplaceView({ account, listings, loading, pendingAction, onBuy, onCancel, onConnect }) {
  const [amounts, setAmounts] = useState({});
  const submitBuy = async listing => {
    try { await onBuy(listing.id, amounts[listing.id]); } catch { /* banner owns error */ }
  };
  const cancelListing = async listingId => {
    try { await onCancel(listingId); } catch { /* banner owns error */ }
  };

  if (loading) return <div className="skeleton-grid" aria-label="正在載入市場"><span /><span /><span /></div>;
  if (!listings.length) return <EmptyState title="目前沒有二手掛單" detail="Demo 種子資料建立後，Alice 的 VIP 票券會出現在這裡。" />;

  return (
    <div className="card-grid">
      {listings.map(listing => {
        const ticket = listing.ticket || {};
        const mine = account && listing.seller.toLowerCase() === account.toLowerCase();
        return (
          <article className="listing-card" key={listing.id}>
            <TicketArtwork metadataURI={ticket.uri || ticket.metadataURI} label={ticket.eventName || `票券 ${listing.tokenId}`} />
            <div className="card-content">
              <div className="eyebrow-row"><span className="eyebrow">二手市場</span><span>剩餘 {listing.amount} 張</span></div>
              <h3>{ticket.eventName || `鏈上票券 #${listing.tokenId}`}</h3>
              <p className="ticket-meta">{ticket.eventDate || '活動時間待公布'} · {ticket.ticketType || '一般票種'}</p>
              <div className="price-row"><strong>{formatWeiAsEth(listing.pricePerItem)} ETH</strong><span>／張</span></div>
              <p className="seller">賣家 {shortAddress(listing.seller)}</p>
              {account ? (
                <div className="purchase-row">
                  <label><span className="sr-only">購買數量</span><input value={amounts[listing.id] || ''} onChange={event => setAmounts(current => ({ ...current, [listing.id]: event.target.value }))} inputMode="numeric" placeholder="數量" /></label>
                  <button className="button button-primary" type="button" disabled={Boolean(pendingAction) || mine} onClick={() => submitBuy(listing)}>{pendingAction === `buy-${listing.id}` ? '確認中…' : mine ? '自己的掛單' : '立即購買'}</button>
                </div>
              ) : <button className="button button-primary button-full" type="button" onClick={onConnect}>連接錢包購買</button>}
              {mine && <button className="text-button" type="button" disabled={Boolean(pendingAction)} onClick={() => cancelListing(listing.id)}>{pendingAction === `cancel-${listing.id}` ? '取消中…' : '取消這筆掛單'}</button>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
