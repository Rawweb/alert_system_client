import { useState } from 'react';
import {
  Download,
  BarChart3,
  Package,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useSummary,
  useByCategory,
  useExpiringSoon,
} from '../../hooks/useReports';
import RiskBadge from '../../components/ui/RiskBadge';
import api from '../../api/axios';

// Readable date: "30 Jul 2026"
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// How many days from today until expiry (positive = future)
const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// The four sectors, used for the category table ordering
const CATEGORIES = [
  'Food and Beverages',
  'Pharmaceuticals and Medications',
  'Cosmetics and Personal Care',
  'Household and Chemical Products',
];

// Short label for each category in the table
const SHORT = {
  'Food and Beverages': 'Food and Beverages',
  'Pharmaceuticals and Medications': 'Pharmaceuticals',
  'Cosmetics and Personal Care': 'Cosmetics',
  'Household and Chemical Products': 'Household',
};

const Reports = () => {
  const [days, setDays] = useState(30);
  const [downloading, setDownloading] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: categoryData, isLoading: categoryLoading } = useByCategory();
  const { data: soonData, isLoading: soonLoading } = useExpiringSoon(days);

  // ---- CSV download ----
  // We call the backend's /reports/download endpoint which returns
  // a CSV text blob. We create a temporary <a> tag, click it
  // programmatically to trigger the browser's Save dialog,
  // then remove the tag. This is the standard browser download pattern.
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/reports/download', {
        responseType: 'blob', // tell axios to expect binary/text, not JSON
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `expiry-report-${new Date().toISOString().split('T')[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  // ---- Build the breakdown rows in sector order ----
  const breakdownMap = {};
  (categoryData?.breakdown || []).forEach((item) => {
    breakdownMap[item.category] = item;
  });

  const byRisk = summary?.byRiskStatus || {};

  return (
    <div className='space-y-6'>
      {/* ── Page header ── */}
      <div
        className='flex flex-col sm:flex-row sm:items-center
                      justify-between gap-3'
      >
        <div>
          <h2 className='text-xl font-bold text-text-heading'>Reports</h2>
          <p className='text-sm text-text-muted mt-0.5'>
            Expiry analytics and downloadable inventory report
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className='btn flex items-center gap-2 sm:w-auto'
        >
          <Download size={16} />
          {downloading ? 'Downloading...' : 'Download CSV Report'}
        </button>
      </div>

      {/* ── Summary strip ── */}
      {/* Five bordered tiles in a row, showing key inventory numbers */}
      <div className='card'>
        <div
          className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5
                        divide-y sm:divide-y-0 divide-border
                        sm:divide-x sm:border-r-0'
        >
          {[
            {
              label: 'Total Products',
              value: summary?.totalProducts,
              icon: Package,
              color: 'text-primary',
            },
            {
              label: 'Expired',
              value: byRisk.expired,
              icon: XCircle,
              color: 'text-danger',
            },
            {
              label: 'Critical',
              value: byRisk.critical,
              icon: AlertTriangle,
              color: 'text-critical',
            },
            {
              label: 'Warning',
              value: byRisk.warning,
              icon: Clock,
              color: 'text-warning',
            },
            {
              label: 'Safe',
              value: byRisk.safe,
              icon: CheckCircle,
              color: 'text-safe',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className='flex items-center gap-3 px-5 py-4'>
              <Icon size={20} className={`flex-shrink-0 ${color}`} />
              <div>
                <p className='text-xs text-text-muted'>{label}</p>
                {summaryLoading ? (
                  <div
                    className='h-6 w-10 bg-hover rounded
                                  animate-pulse mt-0.5'
                  />
                ) : (
                  <p className='text-xl font-bold text-text-heading'>
                    {value ?? 0}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category breakdown table ── */}
      <div className='card overflow-hidden'>
        <div
          className='px-5 py-4 border-b border-border flex items-center
                        gap-3'
        >
          <BarChart3 size={18} className='text-text-muted flex-shrink-0' />
          <div>
            <h3 className='text-sm font-semibold text-text-heading'>
              Breakdown by Category
            </h3>
            <p className='text-xs text-text-muted mt-0.5'>
              Risk distribution across the four product sectors
            </p>
          </div>
        </div>

        <div className='overflow-x-auto thin-scrollbar'>
          <table className='w-full text-sm min-w-[600px]'>
            <thead>
              <tr className='border-b border-border bg-bg'>
                {[
                  'Category',
                  'Total',
                  'Expired',
                  'Critical',
                  'Warning',
                  'Safe',
                  'Health',
                ].map((col) => (
                  <th
                    key={col}
                    className='text-left px-5 py-3 text-xs font-semibold
                                 text-text-muted uppercase tracking-wide'
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className='divide-y divide-border'>
              {categoryLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className='px-5 py-3'>
                          <div className='h-4 bg-hover rounded animate-pulse' />
                        </td>
                      ))}
                    </tr>
                  ))
                : CATEGORIES.map((cat) => {
                    const row = breakdownMap[cat];
                    if (!row) return null;

                    const safe = row.safe || 0;
                    const warning = row.warning || 0;
                    const critical = row.critical || 0;
                    const expired = row.expired || 0;
                    const total = row.total || 0;

                    // Health score: percentage of safe products in the category
                    const healthPct =
                      total > 0 ? Math.round((safe / total) * 100) : 0;

                    // Health bar color: green above 70, amber 40-70, red below 40
                    const barColor =
                      healthPct >= 70
                        ? 'bg-safe'
                        : healthPct >= 40
                          ? 'bg-warning'
                          : 'bg-danger';

                    return (
                      <tr
                        key={cat}
                        className='hover:bg-hover transition-colors'
                      >
                        <td className='px-5 py-3 font-medium text-text-heading'>
                          {SHORT[cat]}
                        </td>

                        <td className='px-5 py-3 text-text font-semibold'>
                          {total}
                        </td>

                        <td className='px-5 py-3 text-danger font-medium'>
                          {expired}
                        </td>

                        <td className='px-5 py-3 text-critical font-medium'>
                          {critical}
                        </td>

                        <td className='px-5 py-3 text-warning font-medium'>
                          {warning}
                        </td>

                        <td className='px-5 py-3 text-safe font-medium'>
                          {safe}
                        </td>

                        {/* Health bar: visual percentage of safe products */}
                        <td className='px-5 py-3'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-24 h-1.5 bg-bg rounded-full
                                          overflow-hidden flex-shrink-0'
                            >
                              <div
                                className={`h-full rounded-full ${barColor}
                                          transition-all duration-500`}
                                style={{ width: `${healthPct}%` }}
                              />
                            </div>
                            <span className='text-xs text-text-muted'>
                              {healthPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>

            {/* Table footer: column totals */}
            {!categoryLoading && (
              <tfoot>
                <tr className='border-t-2 border-border bg-bg'>
                  <td
                    className='px-5 py-3 text-xs font-bold text-text-muted
                                 uppercase tracking-wide'
                  >
                    Total
                  </td>
                  <td className='px-5 py-3 font-bold text-text-heading'>
                    {summary?.totalProducts ?? 0}
                  </td>
                  <td className='px-5 py-3 font-bold text-danger'>
                    {byRisk.expired ?? 0}
                  </td>
                  <td className='px-5 py-3 font-bold text-critical'>
                    {byRisk.critical ?? 0}
                  </td>
                  <td className='px-5 py-3 font-bold text-warning'>
                    {byRisk.warning ?? 0}
                  </td>
                  <td className='px-5 py-3 font-bold text-safe'>
                    {byRisk.safe ?? 0}
                  </td>
                  <td className='px-5 py-3' />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Expiring Soon ── */}
      <div className='card overflow-hidden'>
        {/* Header with the days selector */}
        <div
          className='px-5 py-4 border-b border-border flex flex-col
                        sm:flex-row sm:items-center justify-between gap-3'
        >
          <div>
            <h3 className='text-sm font-semibold text-text-heading'>
              Expiring Soon
            </h3>
            <p className='text-xs text-text-muted mt-0.5'>
              {soonData?.total ?? 0} product(s) expiring within {days} days
            </p>
          </div>

          {/* Days selector: pill buttons to switch between windows */}
          <div
            className='flex gap-1 p-1 bg-bg rounded-lg border border-border
                          w-fit'
          >
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium
                            transition-colors duration-150
                            ${
                              days === d
                                ? 'bg-surface text-text-heading shadow-sm'
                                : 'text-text-muted hover:text-text-heading'
                            }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        <div className='overflow-x-auto thin-scrollbar'>
          <table className='w-full text-sm min-w-[700px]'>
            <thead>
              <tr className='border-b border-border bg-bg'>
                {[
                  'Product',
                  'Category',
                  'Batch',
                  'Expiry Date',
                  'Days Left',
                  'Qty',
                  'Location',
                  'Status',
                ].map((col) => (
                  <th
                    key={col}
                    className='text-left px-5 py-3 text-xs font-semibold
                               text-text-muted uppercase tracking-wide
                               whitespace-nowrap'
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className='divide-y divide-border'>
              {soonLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className='px-5 py-3'>
                        <div className='h-4 bg-hover rounded animate-pulse' />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (soonData?.products || []).length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-5 py-12 text-center
                                              text-text-muted text-sm'
                  >
                    No products expiring within {days} days. That's good news.
                  </td>
                </tr>
              ) : (
                (soonData?.products || []).map((product) => {
                  const remaining = daysUntil(product.expiryDate);

                  // Color the days-left number by urgency
                  const urgencyColor =
                    remaining <= 7
                      ? 'text-danger font-bold'
                      : remaining <= 14
                        ? 'text-critical font-semibold'
                        : 'text-warning font-medium';

                  return (
                    <tr
                      key={product._id}
                      className='hover:bg-hover transition-colors'
                    >
                      <td className='px-5 py-3'>
                        <p className='font-medium text-text-heading'>
                          {product.name}
                        </p>
                      </td>

                      <td className='px-5 py-3 text-text whitespace-nowrap'>
                        {SHORT[product.category] || product.category}
                      </td>

                      <td className='px-5 py-3 text-text-muted text-xs'>
                        {product.batchNumber}
                      </td>

                      <td className='px-5 py-3 text-text whitespace-nowrap'>
                        {formatDate(product.expiryDate)}
                      </td>

                      <td
                        className={`px-5 py-3 whitespace-nowrap ${urgencyColor}`}
                      >
                        {remaining === 0 ? 'Today' : `${remaining}d`}
                      </td>

                      <td className='px-5 py-3 text-text'>
                        {product.quantity}
                      </td>

                      <td className='px-5 py-3 text-text whitespace-nowrap'>
                        {product.storageLocation}
                      </td>

                      <td className='px-5 py-3'>
                        <RiskBadge status={product.riskStatus} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
