import { useState } from 'react';

const initialForm = { eventName: '2026 Demo Concert', eventDate: '2026-12-20 19:30', ticketType: 'VIP', metadataURI: 'http://localhost:3000/metadata.json', amount: '3', to: '' };

export default function OrganizerView({ account, tickets, listings, pendingAction, onMint }) {
  const [form, setForm] = useState(() => ({ ...initialForm, to: account || '' }));
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    try { await onMint(form); } catch { /* banner owns error */ }
  };
  const totalSupply = tickets.reduce((sum, ticket) => sum + Number(ticket.supply || 0), 0);

  return (
    <div className="organizer-layout">
      <section className="metrics-grid" aria-label="主辦方摘要">
        <div className="metric"><span>票券種類</span><strong>{tickets.length}</strong><small>鏈上 token types</small></div>
        <div className="metric"><span>已發行票券</span><strong>{totalSupply}</strong><small>ERC-1155 supply</small></div>
        <div className="metric"><span>市場掛單</span><strong>{listings.length}</strong><small>active listings</small></div>
      </section>
      <section className="organizer-panel">
        <div className="section-heading compact"><div><span className="section-kicker">Organizer Console</span><h2>建立並鑄造票券</h2></div><p>交易確認後會自動同步市場與持有資料。</p></div>
        <form className="mint-form" onSubmit={submit}>
          <label>活動名稱<input name="eventName" value={form.eventName} onChange={update} /></label>
          <label>活動時間<input name="eventDate" value={form.eventDate} onChange={update} /></label>
          <label>票種<input name="ticketType" value={form.ticketType} onChange={update} /></label>
          <label>發行數量<input name="amount" inputMode="numeric" value={form.amount} onChange={update} /></label>
          <label className="field-wide">Metadata URI<input name="metadataURI" value={form.metadataURI} onChange={update} /></label>
          <label className="field-wide">接收錢包地址<input name="to" value={form.to} onChange={update} placeholder={account} /></label>
          <button className="button button-primary field-wide" type="submit" disabled={Boolean(pendingAction)}>{pendingAction === 'mint' ? '等待鏈上確認…' : '鑄造 Demo 票券'}</button>
        </form>
      </section>
    </div>
  );
}
