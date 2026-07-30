// A colored pill that displays a risk status.
// Colors come entirely from the CSS token system, so they adapt
// to light and dark mode automatically.
const STYLES = {
  expired: 'bg-danger/10 text-danger',
  critical: 'bg-critical/10 text-critical',
  warning: 'bg-warning/15 text-warning',
  safe: 'bg-safe/10 text-safe',
  unclassified: 'bg-text-muted/10 text-text-muted',
};

const RiskBadge = ({ status }) => {
  const style = STYLES[status] || STYLES.unclassified;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                  text-xs font-semibold uppercase tracking-wide ${style}`}
    >
      {status}
    </span>
  );
};

export default RiskBadge;
