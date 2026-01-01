import { LineChart, Line,  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Line Chart Component
export const RevenueLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
        <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1A1A1A', 
            border: '1px solid #D4AF37',
            borderRadius: '8px',
            color: '#FFD700'
          }}
          labelStyle={{ color: '#FFD700' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#FFD700" 
          strokeWidth={3} 
          dot={{ fill: '#FFD700', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};