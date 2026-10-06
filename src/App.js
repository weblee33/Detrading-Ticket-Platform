import { useEffect, useState } from 'react';
import './App.css';
import EmptyState from './components/EmptyState';
import AdmissionPassView from './components/AdmissionPassView';
import GateView from './components/GateView';
import MarketplaceView from './components/MarketplaceView';
import MyTicketsView from './components/MyTicketsView';
import OrganizerView from './components/OrganizerView';
import TransactionBanner from './components/TransactionBanner';
import WalletBar from './components/WalletBar';
import { useTicketPlatform } from './hooks/useTicketPlatform';

const pages = [
  { id: 'market', label: '探索市場' },
  { id: 'tickets', label: '我的票券' },
  { id: 'admission', label: '入場票證' },
  { id: 'gate', label: '驗票工作台', gateOnly: true },
  { id: 'organizer', label: '主辦方後台', ownerOnly: true }
];

function App() {
  const platform = useTicketPlatform();
  const [page, setPage] = useState('market');

  useEffect(() => {
    if (page === 'organizer' && !platform.isOwner) setPage('market');
    if (page === 'gate' && !platform.isGateStaff) setPage('market');
  }, [page, platform.isOwner, platform.isGateStaff]);

  const visiblePages = pages.filter(item => (!item.ownerOnly || platform.isOwner) && (!item.gateOnly || platform.isGateStaff));
  const openListings = platform.listings.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Detrading 首頁"><span className="brand-mark" aria-hidden="true">D</span><span><strong>DETRADING</strong><small>VERIFIABLE TICKETING</small></span></a>
        <WalletBar account={platform.account} role={platform.role} loading={platform.loading} pending={Boolean(platform.pendingAction)} onConnect={platform.connect} onRefresh={platform.refresh} />
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">ERC-1155 · Escrow Marketplace · Local Demo</span>
            <h1>讓每一張票，都能被驗證與追蹤。</h1>
            <p>從主辦方鑄票、持有人轉售到鏈上購買，所有 Demo 流程都在同一個可重現環境完成。</p>
            <div className="hero-actions"><button className="button button-primary button-large" type="button" onClick={() => setPage('market')}>查看二手市場</button><button className="button button-secondary button-large" type="button" onClick={() => setPage('tickets')}>管理我的票券</button></div>
          </div>
          <div className="hero-proof" aria-label="平台即時摘要">
            <div><span>合約版本</span><strong>V2</strong><small>Escrow enabled</small></div>
            <div><span>票券種類</span><strong>{platform.tickets.length}</strong><small>On-chain types</small></div>
            <div><span>可購張數</span><strong>{openListings}</strong><small>Marketplace supply</small></div>
          </div>
        </section>

        <TransactionBanner status={platform.status} error={platform.error} />

        <nav className="page-tabs" aria-label="平台功能">
          {visiblePages.map(item => <button key={item.id} type="button" className={page === item.id ? 'active' : ''} aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}>{item.label}</button>)}
        </nav>

        <section className="workspace">
          {page === 'market' && <><div className="section-heading"><div><span className="section-kicker">Secondary Market</span><h2>鏈上二手票券</h2></div><p>票券由智慧合約託管，完成付款後才轉移給買家。</p></div><MarketplaceView account={platform.account} listings={platform.listings} loading={platform.loading} pendingAction={platform.pendingAction} onBuy={platform.buy} onCancel={platform.cancel} onConnect={platform.connect} /></>}
          {page === 'tickets' && <><div className="section-heading"><div><span className="section-kicker">My Wallet</span><h2>我的鏈上票券</h2></div><p>只顯示目前錢包實際持有、尚未進入市場託管的票券。</p></div><MyTicketsView account={platform.account} tickets={platform.ownedTickets} loading={platform.loading} pendingAction={platform.pendingAction} onList={platform.list} onConnect={platform.connect} /></>}
          {page === 'admission' && <AdmissionPassView account={platform.account} tickets={platform.ownedTickets} pendingAction={platform.pendingAction} onCreatePass={platform.createAdmissionPass} onConnect={platform.connect} />}
          {page === 'gate' && platform.isGateStaff && <GateView tickets={platform.tickets} pendingAction={platform.pendingAction} onRedeem={platform.redeemAdmissionPass} />}
          {page === 'organizer' && platform.isOwner && <OrganizerView account={platform.account} tickets={platform.tickets} listings={platform.listings} pendingAction={platform.pendingAction} onMint={platform.mint} />}
          {page === 'organizer' && !platform.isOwner && <EmptyState title="需要主辦方帳號" detail="請切換至 Hardhat Account #0 後重新連接。" />}
        </section>
      </main>

      <footer><span>Detrading Ticket Platform · Demo Environment</span><span>請勿使用真實資金或主網錢包</span></footer>
    </div>
  );
}

export default App;
