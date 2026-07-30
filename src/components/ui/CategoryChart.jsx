import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const ABBREV = {
  'Food and Beverages': 'Food',
  'Pharmaceuticals and Medications': 'Pharma',
  'Cosmetics and Personal Care': 'Cosmetics',
  'Household and Chemical Products': 'Household',
};

const BAR_COLORS = {
  light: {
    expired: '#dc2626',
    critical: '#ea580c',
    warning: '#f59e0b',
    safe: '#10b981',
  },
  dark: {
    expired: '#f87171',
    critical: '#fb923c',
    warning: '#fbbf24',
    safe: '#34d399',
  },
};

const CategoryChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const colors = BAR_COLORS[theme] || BAR_COLORS.light;

  // SVG-facing hexes that must match the theme
  const gridStroke = theme === 'dark' ? '#2a3341' : '#e2e8f0';
  const axisColor = '#94a3b8';
  const legendColor = theme === 'dark' ? '#e2e8f0' : '#475569';
  const tooltipBg = theme === 'dark' ? '#10151f' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#2a3341' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#e2e8f0' : '#475569';

  if (loading) {
    return (
      <div className='card p-5'>
        <div className='h-5 w-44 bg-bg rounded animate-pulse mb-4' />
        <div className='h-56 bg-bg rounded-xl animate-pulse' />
      </div>
    );
  }

  const chartData = (data?.breakdown || []).map((item) => ({
    name: ABBREV[item.category] || item.category,
    Expired: item.expired,
    Critical: item.critical,
    Warning: item.warning,
    Safe: item.safe,
  }));

  return (
    <div className='card p-5 flex flex-col w-full'>
      <h3 className='text-sm font-semibold text-text-heading mb-1'>
        Products by Category
      </h3>
      <p className='text-xs text-text-muted mb-4'>
        Risk breakdown across the four product sectors
      </p>

      <div className='flex-1 flex items-center min-h-[220px]'>
        <ResponsiveContainer width='100%' height={220}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke={gridStroke}
              vertical={false}
            />
            <XAxis
              dataKey='name'
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: `1px solid ${tooltipBorder}`,
                fontSize: '13px',
                backgroundColor: tooltipBg,
                color: tooltipText,
              }}
              cursor={{ fill: theme === 'dark' ? '#ffffff10' : '#00000008' }}
            />
            <Legend
              iconType='circle'
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: '12px', color: legendColor }}>
                  {value}
                </span>
              )}
            />

            <Bar dataKey='Expired' stackId='a' fill={colors.expired} />
            <Bar dataKey='Critical' stackId='a' fill={colors.critical} />
            <Bar dataKey='Warning' stackId='a' fill={colors.warning} />
            <Bar
              dataKey='Safe'
              stackId='a'
              fill={colors.safe}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
