// accent: one of 'primary' | 'danger' | 'critical' | 'warning' | 'safe' | 'muted'
// Card body stays neutral; only a small dot and the icon tint carry the color.
const StatCard = ({
  label,
  value,
  icon: Icon,
  accent = 'muted',
  loading = false,
}) => {
  // Map accent name to the token-based classes. Full literal strings
  // so Tailwind includes them in the build.
  const ACCENTS = {
    primary: { dot: 'bg-primary', icon: 'text-primary' },
    danger: { dot: 'bg-danger', icon: 'text-danger' },
    critical: { dot: 'bg-critical', icon: 'text-critical' },
    warning: { dot: 'bg-warning', icon: 'text-warning' },
    safe: { dot: 'bg-safe', icon: 'text-safe' },
    muted: { dot: 'bg-text-muted', icon: 'text-text-muted' },
  };

  const a = ACCENTS[accent] || ACCENTS.muted;

  return (
    <div className='card p-5 flex items-center gap-4 relative'>
      {/* Small colored accent dot, top-right */}
      <span
        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${a.dot}`}
      />

      {/* Icon box: neutral bg, colored icon */}
      <div className={`rounded-xl p-3 flex-shrink-0 bg-bg ${a.icon}`}>
        {Icon && <Icon size={20} />}
      </div>

      <div className='flex-1 min-w-0'>
        <p
          className='text-xs text-text-muted uppercase tracking-wide
                      font-medium truncate'
        >
          {label}
        </p>

        {loading ? (
          <div className='h-7 w-16 bg-bg rounded animate-pulse mt-1' />
        ) : (
          <p className='text-2xl font-bold mt-0.5 text-text-heading'>
            {value ?? 0}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
