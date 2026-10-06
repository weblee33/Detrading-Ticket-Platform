import { useEffect, useState } from 'react';
import { ipfsToHttp } from '../utils/display';

export default function TicketArtwork({ metadataURI, label }) {
  const [image, setImage] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setImage('');
    setFailed(false);
    if (!metadataURI) return () => { active = false; };
    fetch(ipfsToHttp(metadataURI))
      .then(response => {
        if (!response.ok) throw new Error('metadata unavailable');
        return response.json();
      })
      .then(metadata => {
        if (active) setImage(ipfsToHttp(metadata.image));
      })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [metadataURI]);

  if (image && !failed) {
    return <img className="ticket-artwork" src={image} alt={`${label} 活動封面`} onError={() => setFailed(true)} />;
  }
  return (
    <div className="ticket-artwork ticket-artwork-fallback" aria-label={`${label} 活動封面預留區`}>
      <span>DT</span>
      <small>ON-CHAIN TICKET</small>
    </div>
  );
}
