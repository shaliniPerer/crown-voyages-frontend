import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Metric Card Component
export const MetricCard = ({ title, value, icon: Icon, change, color = 'from-gold-600 to-gold-500' }) => {
  const isPositive = change?.startsWith('+');

  return (
    <div className="card-luxury relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-10 h-10 text-gold-500" />
          {change && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-100 mt-2">{value}</p>
      </div>
    </div>
  );
};