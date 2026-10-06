import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import EmptyState from './EmptyState';
import { admissionExpiry, encodeAdmissionPass } from '../utils/admission';
import { shortAddress } from '../utils/display';

export default function AdmissionPassView({ account, tickets, pendingAction, onCreatePass, onConnect }) {
  const [tokenId, setTokenId] = useState('');
  const [pass, setPass] = useState(null);
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const selectedTicket = useMemo(() => tickets.find(item => String(item.id) === tokenId), [tickets, tokenId]);

  useEffect(() => {
    if (!tokenId && tickets[0]) setTokenId(String(tickets[0].id));
  }, [tickets, tokenId]);

  useEffect(() => {
    let active = true;
    if (!pass) { setQr(''); return () => { active = false; }; }
    QRCode.toDataURL(encodeAdmissionPass(pass), { width: 320, margin: 2, errorCorrectionLevel: 'M' })
      .then(value => { if (active) setQr(value); });
    return () => { active = false; };
  }, [pass]);

  if (!account) return <EmptyState title="連接錢包產生入場票證" detail="持票人需使用目前錢包簽署一張五分鐘有效的入場票證。" action={<button className="button button-primary" type="button" onClick={onConnect}>連接 MetaMask</button>} />;
  if (!tickets.length) return <EmptyState title="沒有可核銷的票券" detail="已掛單託管或已核銷的票券不會出現在這裡。" />;

  const create = async () => {
    try { setPass(await onCreatePass(Number(tokenId))); } catch { /* banner owns error */ }
  };
  const copy = async () => {
    await navigator.clipboard.writeText(encodeAdmissionPass(pass));
    setCopied(true);
  };

  return (
    <div className="admission-layout">
      <section className="pass-builder">
        <span className="section-kicker">Holder Signature</span>
        <h2>產生限時入場 QR</h2>
        <p>簽章包含合約、鏈 ID、持票人、Token ID、nonce 與到期時間，無法移到其他鏈或合約重放。</p>
        <label>選擇票券<select value={tokenId} onChange={event => { setTokenId(event.target.value); setPass(null); }}>
          {tickets.map(ticket => <option value={ticket.id} key={ticket.id}>{ticket.eventName}・{ticket.ticketType}（持有 {ticket.balance}）</option>)}
        </select></label>
        <button className="button button-primary button-full" type="button" disabled={Boolean(pendingAction)} onClick={create}>{pendingAction === `pass-${tokenId}` ? '等待錢包簽章…' : '簽署並產生 QR Code'}</button>
        <div className="security-note"><strong>一次性安全設計</strong><span>核銷成功後會燃燒一張 ERC-1155 票券；同一 nonce 再次提交會被拒絕。</span></div>
      </section>
      <section className="digital-pass">
        {pass && qr ? <>
          <div className="pass-heading"><div><span>DETRADING ADMISSION</span><strong>{selectedTicket?.eventName}</strong></div><span className="pass-status">READY</span></div>
          <img className="qr-code" src={qr} alt="一次性入場 QR Code" />
          <div className="pass-details"><span>持票人 <strong>{shortAddress(pass.holder)}</strong></span><span>Token <strong>#{pass.tokenId}</strong></span><span>有效期限 <strong>{admissionExpiry(pass).toLocaleTimeString('zh-TW')}</strong></span></div>
          <button className="button button-secondary button-full" type="button" onClick={copy}>{copied ? '已複製票證資料' : '複製票證給驗票工作台'}</button>
        </> : <div className="pass-placeholder"><span>QR</span><strong>尚未產生票證</strong><small>選擇票券並使用錢包簽章</small></div>}
      </section>
    </div>
  );
}
