import { useState } from 'react';
import EmptyState from './EmptyState';
import TicketArtwork from './TicketArtwork';

export default function MyTicketsView({ account, tickets, loading, pendingAction, onList, onConnect }) {
  const [forms, setForms] = useState({});
  const update = (id, field, value) => setForms(current => ({ ...current, [id]: { ...current[id], [field]: value } }));
  const submit = async ticket => {
    try { await onList(ticket.id, forms[ticket.id]?.amount, forms[ticket.id]?.price); } catch { /* banner owns error */ }
  };

  if (!account) return <EmptyState title="連接錢包查看票券" detail="切換 Alice 或 Bob 的 Demo 帳號，即可展示持有與轉售流程。" action={<button className="button button-primary" type="button" onClick={onConnect}>連接 MetaMask</button>} />;
  if (loading) return <div className="skeleton-grid" aria-label="正在載入票券"><span /><span /></div>;
  if (!tickets.length) return <EmptyState title="這個帳號尚未持有票券" detail="可以從市場購買，或由主辦方鑄造票券給此地址。" />;

  return (
    <div className="card-grid">
      {tickets.map(ticket => (
        <article className="owned-card" key={ticket.id}>
          <TicketArtwork metadataURI={ticket.uri || ticket.metadataURI} label={ticket.eventName} />
          <div className="card-content">
            <div className="eyebrow-row"><span className="eyebrow">已驗證持有</span><span>Token #{ticket.id}</span></div>
            <h3>{ticket.eventName}</h3>
            <p className="ticket-meta">{ticket.eventDate} · {ticket.ticketType}</p>
            <div className="balance-block"><strong>{ticket.balance}</strong><span>張可使用票券</span></div>
            <div className="list-form">
              <label>出售數量<input inputMode="numeric" value={forms[ticket.id]?.amount || ''} onChange={event => update(ticket.id, 'amount', event.target.value)} placeholder={`最多 ${ticket.balance}`} /></label>
              <label>每張價格（wei）<input inputMode="numeric" value={forms[ticket.id]?.price || ''} onChange={event => update(ticket.id, 'price', event.target.value)} placeholder="例如 20000000000000000" /></label>
              <button className="button button-secondary" type="button" disabled={Boolean(pendingAction)} onClick={() => submit(ticket)}>{pendingAction === `list-${ticket.id}` || pendingAction === `approve-${ticket.id}` ? '處理中…' : '掛到二手市場'}</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
