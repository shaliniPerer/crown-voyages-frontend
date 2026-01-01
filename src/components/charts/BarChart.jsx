import {BarChart, Bar,  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Bar Chart Component
export const BookingBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="bookings" fill="#FFD700" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};