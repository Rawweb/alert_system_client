import { useState } from 'react';
import { Bell, BellOff, CheckCheck, Check, Package, Clock } from 'lucide-react';
import {
  useAlerts,
  useMarkAlertRead,
  useMarkAllRead,
} from '../../hooks/useAlerts';
import RiskBadge from '../../components/ui/RiskBadge';

// How long ago was this alert created
// e.g. "2 hours ago", "3 days ago"
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Full readable date for the tooltip title
const fullDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Left border color per risk level, using your token hex values
// (inline style because border-l-color needs a real color value,
// Tailwind can't generate dynamic border colors from token names)
const BORDER_COLORS = {
  expired: '#dc2626',
  critical: '#ea580c',
  warning: '#f59e0b',
  safe: '#10b981',
};

const Alerts = () => {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const { data, isLoading } = useAlerts(filter === 'unread');
  const markOneRead = useMarkAlertRead();
  const markAllRead = useMarkAllRead();

  const alerts = data?.alerts || [];
  const total = data?.total || 0;
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  // ---- Filter tabs ----
  const TABS = [
    { key: 'all', label: 'All Alerts' },
    { key: 'unread', label: 'Unread Only' },
  ];

  return (
    <div className='space-y-5'>
      {/* ── Page header ── */}
      <div
        className='flex flex-col sm:flex-row sm:items-center
                      justify-between gap-3'
      >
        <div>
          <h2 className='text-xl font-bold text-text-heading'>Alerts</h2>
          <p className='text-sm text-text-muted mt-0.5'>
            {total} alert{total !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <span className='ml-1 text-danger font-medium'>
                · {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {/* Mark all read button, only shows when there are unread alerts */}
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className='btn flex items-center gap-2 sm:w-auto'
          >
            <CheckCheck size={16} />
            {markAllRead.isPending ? 'Marking...' : 'Mark All as Read'}
          </button>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className='flex gap-1 p-1 bg-bg rounded-lg w-fit border border-border'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium
                        transition-colors duration-150
                        ${
                          filter === tab.key
                            ? 'bg-surface text-text-heading shadow-sm'
                            : 'text-text-muted hover:text-text-heading'
                        }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Alert list ── */}
      <div className='space-y-3'>
        {isLoading ? (
          // Skeleton cards while loading
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='card p-4 flex gap-4 items-start'>
              <div
                className='w-10 h-10 rounded-xl bg-hover
                              animate-pulse flex-shrink-0'
              />
              <div className='flex-1 space-y-2'>
                <div className='h-4 bg-hover rounded animate-pulse w-2/3' />
                <div className='h-3 bg-hover rounded animate-pulse w-full' />
                <div className='h-3 bg-hover rounded animate-pulse w-1/3' />
              </div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          // Empty state
          <div
            className='card p-12 flex flex-col items-center justify-center
                          text-center'
          >
            <div
              className='w-14 h-14 rounded-2xl bg-bg flex items-center
                            justify-center mb-4'
            >
              <BellOff size={26} className='text-text-muted' />
            </div>
            <p className='text-base font-semibold text-text-heading'>
              {filter === 'unread' ? 'All caught up' : 'No alerts yet'}
            </p>
            <p className='text-sm text-text-muted mt-1 max-w-xs'>
              {filter === 'unread'
                ? 'There are no unread alerts. Run a prediction to check your inventory.'
                : 'Run a prediction from the dashboard to generate alerts.'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert._id}
              alert={alert}
              onMarkRead={() => markOneRead.mutate(alert._id)}
              isMarking={markOneRead.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ---- Alert Card ----
// Extracted into its own component so the list stays readable.
// A separate component here is the React way of pulling a
// repeated complex structure out of a long render function.
const AlertCard = ({ alert, onMarkRead, isMarking }) => {
  const product = alert.product;
  const borderColor = BORDER_COLORS[alert.riskStatus] || '#94a3b8';

  return (
    <div
      className={`card p-4 flex gap-4 items-start transition-colors
                  ${!alert.isRead ? 'bg-surface' : 'opacity-70'}`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Risk icon box */}
      <div
        className='w-10 h-10 rounded-xl flex items-center justify-center
                   flex-shrink-0 bg-bg'
      >
        {alert.riskStatus === 'expired' ? (
          <BellOff size={18} className='text-danger' />
        ) : (
          <Bell size={18} className='text-critical' />
        )}
      </div>

      {/* Main content */}
      <div className='flex-1 min-w-0'>
        {/* Top row: product name + badge + unread dot */}
        <div className='flex items-start gap-2 flex-wrap'>
          <span className='text-sm font-semibold text-text-heading'>
            {product?.name || 'Unknown Product'}
          </span>

          <RiskBadge status={alert.riskStatus} />

          {/* Unread dot: small teal dot when alert hasn't been read */}
          {!alert.isRead && (
            <span
              className='w-2 h-2 rounded-full bg-primary
                             flex-shrink-0 mt-1'
            />
          )}
        </div>

        {/* Alert message */}
        <p className='text-sm text-text mt-1 leading-relaxed'>
          {alert.message}
        </p>

        {/* Bottom row: product meta + timestamp */}
        <div className='flex flex-wrap items-center gap-3 mt-2'>
          {product && (
            <>
              <span className='flex items-center gap-1.5 text-xs text-text-muted'>
                <Package size={12} />
                Batch: {product.batchNumber}
              </span>
              <span className='text-xs text-text-muted'>
                {product.category}
              </span>
              <span className='text-xs text-text-muted'>
                {product.storageLocation}
              </span>
            </>
          )}

          <span
            className='flex items-center gap-1 text-xs text-text-muted ml-auto'
            title={fullDate(alert.createdAt)}
          >
            <Clock size={11} />
            {timeAgo(alert.createdAt)}
          </span>
        </div>
      </div>

      {/* Mark as read button (hidden if already read) */}
      {!alert.isRead && (
        <button
          onClick={onMarkRead}
          disabled={isMarking}
          title='Mark as read'
          className='flex-shrink-0 p-1.5 rounded-lg text-text-muted
                     hover:bg-hover hover:text-primary transition-colors'
        >
          <Check size={16} />
        </button>
      )}
    </div>
  );
};

export default Alerts;
