import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

// SVG fills need real hex, not CSS vars. Two sets so the donut
// matches the token palette in each theme.
const RISK_COLORS = {
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

const RiskChart = ({ data, loading }) => {
  const { theme } = useTheme();
  const colors = RISK_COLORS[theme] || RISK_COLORS.light;

  // Center text and tooltip also need real hex values
  const centerNumberColor = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const centerLabelColor = '#94a3b8';
  const tooltipBg = theme === 'dark' ? '#10151f' : '#ffffff';
  const tooltipText = theme === 'dark' ? '#e2e8f0' : '#475569';
  const tooltipBorder = theme === 'dark' ? '#2a3341' : '#e2e8f0';

  if (loading) {
    return (
      <div className='card p-5'>
        <div className='h-5 w-36 bg-bg rounded animate-pulse mb-4' />
        <div className='h-64 bg-bg rounded-xl animate-pulse' />
      </div>
    );
  }

  const byRisk = data?.byRiskStatus || {};
  const total = data?.totalProducts || 0;

  const chartData = Object.entries(byRisk)
    .filter(([key, val]) => key !== 'unclassified' && val > 0)
    .map(([key, val]) => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: val,
      color: colors[key],
      percentage: total > 0 ? Math.round((val / total) * 100) : 0,
    }));

  if (chartData.length === 0) {
    return (
      <div className='card p-5 flex flex-col items-center justify-center h-64'>
        <p className='text-text-muted text-sm text-center'>
          Run a prediction to see risk distribution
        </p>
      </div>
    );
  }

  return (
    <div className='card p-5 w-full'>
      <h3 className='text-sm font-semibold text-text-heading mb-0.5'>
        Risk Distribution
      </h3>
      <p className='text-xs text-text-muted mb-4'>
        Overall classification of all {total} products
      </p>

      <ResponsiveContainer width='100%' height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            innerRadius={62}
            outerRadius={88}
            paddingAngle={3}
            dataKey='value'
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}

            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox;
                return (
                  <>
                    <text
                      x={cx}
                      y={cy - 4}
                      textAnchor='middle'
                      fontSize='28'
                      fontWeight='700'
                      fill={centerNumberColor}
                    >
                      {total}
                    </text>
                    <text
                      x={cx}
                      y={cy + 15}
                      textAnchor='middle'
                      fontSize='11'
                      fill={centerLabelColor}
                    >
                      Products
                    </text>
                  </>
                );
              }}
            />
          </Pie>

          <Tooltip
            formatter={(value, name) => [`${value} product(s)`, name]}
            contentStyle={{
              borderRadius: '8px',
              border: `1px solid ${tooltipBorder}`,
              fontSize: '13px',
              backgroundColor: tooltipBg,
              color: tooltipText,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Percentage breakdown, all tokens except the risk dot/bar hex */}
      <div className='mt-4 space-y-2.5 border-t border-border pt-4'>
        {chartData.map((item) => (
          <div key={item.key} className='flex items-center gap-3'>
            <div
              className='w-2.5 h-2.5 rounded-full flex-shrink-0'
              style={{ backgroundColor: item.color }}
            />
            <span className='text-xs text-text flex-1 capitalize'>
              {item.name}
            </span>
            <span className='text-xs font-semibold text-text-heading'>
              {item.value}
            </span>
            <div className='w-20 h-1.5 bg-bg rounded-full overflow-hidden'>
              <div
                className='h-full rounded-full transition-all duration-500'
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <span className='text-xs text-text-muted w-8 text-right'>
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskChart;
