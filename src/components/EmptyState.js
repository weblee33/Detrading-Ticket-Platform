export default function EmptyState({ title, detail, action }) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">◇</span>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}
