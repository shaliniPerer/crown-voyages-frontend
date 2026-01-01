import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Lead Funnel Component
export const LeadFunnel = ({ data = [] }) => {
  const stages = [
    { name: 'Leads', value: 100, color: 'bg-blue-500' },
    { name: 'Qualified', value: 75, color: 'bg-purple-500' },
    { name: 'Quotations', value: 50, color: 'bg-gold-500' },
    { name: 'Bookings', value: 30, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">{stage.name}</span>
            <span className="text-sm font-semibold text-gray-100">{stage.value}%</span>
          </div>
          <div className="w-full bg-luxury-lighter rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full ${stage.color} transition-all duration-500`}
              style={{ width: `${stage.value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};