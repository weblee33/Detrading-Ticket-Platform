import { useMemo, useState } from 'react';
import { admissionExpiry, parseAdmissionPass } from '../utils/admission';
import { shortAddress } from '../utils/display';

export default function GateView({ tickets, pendingAction, onRedeem }) {
  const [input, setInput] = useState('');
  const [localError, setLocalError] = useState('');
  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try { return parseAdmissionPass(input); }
    catch (error) { return { invalid: error.message }; }
  }, [input]);
  const ticket = parsed && !parsed.invalid ? tickets.find(item => String(item.id) === parsed.tokenId) : null;

  const loadLatest = () => {
    const latest = window.localStorage.getItem('detrading.latestAdmissionPass');
    if (!latest) setLocalError('這個瀏覽器還沒有最近產生的 Demo 票證');
    else { setInput(latest); setLocalError(''); }
  };
  const redeem = async () => {
    try { await onRedeem(parseAdmissionPass(input)); setInput(''); }
    catch (error) { setLocalError(error.message); }
  };

  return (
    <div className="gate-layout">
      <section className="gate-scanner">
        <span className="section-kicker">Gate Staff Console</span>
        <h2>驗票工作台</h2>
        <p>掃描器整合前，可貼上 QR 票證內容；Demo 也能直接載入同一瀏覽器最近產生的票證。</p>
        <label>QR 票證資料<textarea value={input} onChange={event => { setInput(event.target.value); setLocalError(''); }} placeholder="掃描或貼上票證 JSON" /></label>
        <div className="gate-actions"><button className="button button-quiet" type="button" onClick={loadLatest}>載入最近 Demo 票證</button><button className="button button-primary" type="button" disabled={!parsed || parsed.invalid || Boolean(pendingAction)} onClick={redeem}>{pendingAction?.startsWith('redeem-') ? '鏈上核銷中…' : '確認核銷一張票'}</button></div>
        {(localError || parsed?.invalid) && <div className="inline-error" role="alert">{localError || parsed.invalid}</div>}
      </section>
      <section className={`validation-panel ${parsed && !parsed.invalid ? 'has-pass' : ''}`}>
        {parsed && !parsed.invalid ? <>
          <span className="validation-mark">✓</span><h3>票證格式有效</h3>
          <dl><div><dt>活動</dt><dd>{ticket?.eventName || `Token #${parsed.tokenId}`}</dd></div><div><dt>持票人</dt><dd>{shortAddress(parsed.holder)}</dd></div><div><dt>到期時間</dt><dd>{admissionExpiry(parsed).toLocaleString('zh-TW')}</dd></div><div><dt>nonce</dt><dd>{shortAddress(parsed.nonce)}</dd></div></dl>
          <p>送出後仍會由智慧合約驗證簽章、期限、餘額、驗票員權限與重放狀態。</p>
        </> : <div className="pass-placeholder"><span>⌁</span><strong>等待票證</strong><small>有效資料會顯示鏈上核銷摘要</small></div>}
      </section>
    </div>
  );
}
