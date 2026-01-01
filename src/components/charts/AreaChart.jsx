import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,  ResponsiveContainer } from 'recharts';

// Area Chart Component
export const RevenueAreaChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
        <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1A1A1A', 
            border: '1px solid #D4AF37',
            borderRadius: '8px'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#FFD700" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};