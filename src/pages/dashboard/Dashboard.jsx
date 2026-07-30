import { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useSummary, useByCategory } from '../../hooks/useReports';
import { useProducts } from '../../hooks/useProducts';
import StatCard from '../../components/ui/StatCard';
import RiskChart from '../../components/ui/RiskChart';
import CategoryChart from '../../components/ui/CategoryChart';
import RiskBadge from '../../components/ui/RiskBadge';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Format a date string into "12 Jul 2026"
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// How many days since a product expired (positive number)
const daysExpired = (dateStr) => {
  const diff = new Date() - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// How many days until expiry
const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [predicting, setPredicting] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: categoryData, isLoading: categoryLoading } = useByCategory();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  // Filter expired and critical products from the full product list
  const allProducts = productsData?.products || [];
  const expiredProducts = allProducts.filter((p) => p.riskStatus === 'expired');
  const criticalProducts = allProducts.filter(
    (p) => p.riskStatus === 'critical',
  );

  const handleRunPrediction = async () => {
    setPredicting(true);
    try {
      const response = await api.post('/predictions/run');
      const { totalProductsClassified, alertsCreated, emailSent } =
        response.data;

      toast.success(
        `${totalProductsClassified} products classified. ${alertsCreated} new alert(s).`,
      );

      if (emailSent) {
        toast.success('Alert summary email sent');
      }

      // Refresh every cached query so charts, lists, and badges update
      queryClient.invalidateQueries();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Prediction failed. Is the ML service running?',
      );
    } finally {
      setPredicting(false);
    }
  };

  const STAT_CARDS = [
    {
      label: 'Total Products',
      value: summary?.totalProducts,
      icon: Package,
      accent: 'primary',
    },
    {
      label: 'Expired',
      value: summary?.byRiskStatus?.expired,
      icon: XCircle,
      accent: 'danger',
    },
    {
      label: 'Critical',
      value: summary?.byRiskStatus?.critical,
      icon: AlertTriangle,
      accent: 'critical',
    },
    {
      label: 'Warning',
      value: summary?.byRiskStatus?.warning,
      icon: Clock,
      accent: 'warning',
    },
    {
      label: 'Safe',
      value: summary?.byRiskStatus?.safe,
      icon: CheckCircle,
      accent: 'safe',
    },
    {
      label: 'Unread Alerts',
      value: summary?.unreadAlerts,
      icon: Bell,
      accent: 'primary',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* ── Top bar: title + prediction button ── */}
      <div
        className='flex flex-col sm:flex-row sm:items-center
                      sm:justify-between gap-3'
      >
        <div>
          <h2 className='text-xl font-bold text-text-heading'>
            Inventory Overview
          </h2>
          <p className='text-sm text-text-muted mt-0.5'>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <button
          onClick={handleRunPrediction}
          disabled={predicting}
          className='btn flex items-center gap-2 sm:w-auto w-full
                     justify-center'
        >
          <RefreshCw size={16} className={predicting ? 'animate-spin' : ''} />
          {predicting ? 'Running Prediction...' : 'Run Prediction Now'}
        </button>
      </div>

      {/* ── Stat cards: 2 cols on mobile, 3 on md, 6 on xl ── */}
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'>
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            loading={summaryLoading}
          />
        ))}
      </div>

      {/* ── Charts row: stacked on mobile, side by side on lg ── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-stretch'>
        {/* Donut chart takes 1 column */}
        <div className='lg:col-span-1 flex'>
          <RiskChart data={summary} loading={summaryLoading} />
        </div>

        {/* Bar chart takes 2 columns */}
        <div className='lg:col-span-2 flex'>
          <CategoryChart data={categoryData} loading={categoryLoading} />
        </div>
      </div>

      {/* ── Product lists row: stacked on mobile, side by side on lg ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        {/* Expired Products List */}
        <div className='card'>
          <div
            className='px-5 py-4 border-b border-border flex items-center
                          justify-between'
          >
            <div>
              <h3 className='text-sm font-bold text-text-heading uppercase'>
                Expired Products
              </h3>
              <p className='text-xs text-text-muted mt-0.5'>
                Must be removed from inventory immediately
              </p>
            </div>
            <span
              className='text-xs font-bold text-red-600 bg-red-50
                             dark:bg-red-900/20 dark:text-red-400
                             px-2.5 py-1 rounded-full'
            >
              {expiredProducts.length}
            </span>
          </div>

          <div className='divide-y divide-border max-h-72 overflow-y-auto thin-scrollbar'>
            {productsLoading ? (
              // Skeleton rows while loading
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='px-5 py-3 flex items-center gap-3'>
                  <div
                    className='h-4 bg-gray-200 dark:bg-gray-700 rounded
                                  animate-pulse flex-1'
                  />
                  <div
                    className='h-4 w-16 bg-gray-200 dark:bg-gray-700
                                  rounded animate-pulse'
                  />
                </div>
              ))
            ) : expiredProducts.length === 0 ? (
              <div className='px-5 py-8 text-center'>
                <CheckCircle
                  size={32}
                  className='text-emerald-400 mx-auto mb-2'
                />
                <p className='text-sm text-text-muted'>
                  No expired products detected
                </p>
              </div>
            ) : (
              expiredProducts.map((product) => (
                <div
                  key={product._id}
                  className='px-5 py-3 flex items-start gap-3
                             hover:bg-hover transition-colors cursor-default'
                >
                  <div className='flex-1 min-w-0'>
                    <p
                      className='text-sm font-medium text-text-heading
                                  truncate'
                    >
                      {product.name}
                    </p>
                    <p className='text-xs text-text-muted mt-0.5'>
                      Batch: {product.batchNumber} · {product.storageLocation}
                    </p>
                  </div>

                  <div className='text-right flex-shrink-0'>
                    <p
                      className='text-xs font-semibold text-red-600
                                  dark:text-red-400'
                    >
                      {daysExpired(product.expiryDate)}d ago
                    </p>
                    <p className='text-xs text-text-muted mt-0.5'>
                      {formatDate(product.expiryDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical Products List */}
        <div className='card'>
          <div
            className='px-5 py-4 border-b border-border flex items-center
                          justify-between'
          >
            <div>
              <h3 className='text-sm font-bold text-text-heading uppercase'>
                Critical: Expiring Within 7 Days
              </h3>
              <p className='text-xs text-text-muted mt-0.5'>
                Requires immediate attention
              </p>
            </div>
            <span
              className='text-xs font-bold text-orange-600 bg-orange-50
                             dark:bg-orange-900/20 dark:text-orange-400
                             px-2.5 py-1 rounded-full'
            >
              {criticalProducts.length}
            </span>
          </div>

          <div className='divide-y divide-border max-h-72 overflow-y-auto thin-scrollbar'>
            {productsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='px-5 py-3 flex items-center gap-3'>
                  <div
                    className='h-4 bg-gray-200 dark:bg-gray-700 rounded
                                  animate-pulse flex-1'
                  />
                  <div
                    className='h-4 w-16 bg-gray-200 dark:bg-gray-700
                                  rounded animate-pulse'
                  />
                </div>
              ))
            ) : criticalProducts.length === 0 ? (
              <div className='px-5 py-8 text-center'>
                <CheckCircle
                  size={32}
                  className='text-emerald-400 mx-auto mb-2'
                />
                <p className='text-sm text-text-muted'>
                  No critical products right now
                </p>
              </div>
            ) : (
              criticalProducts.map((product) => (
                <div
                  key={product._id}
                  className='px-5 py-3 flex items-start gap-3
                             hover:bg-hover transition-colors cursor-default'
                >
                  <div className='flex-1 min-w-0'>
                    <p
                      className='text-sm font-medium text-text-heading
                                  truncate'
                    >
                      {product.name}
                    </p>
                    <p className='text-xs text-text-muted mt-0.5'>
                      Batch: {product.batchNumber} · {product.storageLocation}
                    </p>
                  </div>

                  <div className='text-right flex-shrink-0'>
                    <p
                      className='text-xs font-semibold text-orange-600
                                  dark:text-orange-400'
                    >
                      {daysUntil(product.expiryDate)}d left
                    </p>
                    <p className='text-xs text-text-muted mt-0.5'>
                      {formatDate(product.expiryDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
