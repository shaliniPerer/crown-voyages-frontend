import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/common/Card';
import { dashboardApi } from '../api/dashbaordApi';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    outstandingPayments: 0,
    activeGuests: 0,
    monthly: {
      bookings: 0,
      revenue: 0
    }
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, bookingsRes, revenueRes, statusRes] = await Promise.all([
        dashboardApi.getMetrics().catch(() => ({ data: { totalBookings: 0, totalRevenue: 0, outstandingPayments: 0, activeGuests: 0, monthly: { bookings: 0, revenue: 0 } } })),
        dashboardApi.getUpcomingBookings({ limit: 5 }).catch(() => ({ data: [] })),
        dashboardApi.getRevenueChart(period).catch(() => ({ data: [] })),
        dashboardApi.getLeadStatus().catch(() => ({ data: [] }))
      ]);

      setMetrics(metricsRes.data || {
        totalBookings: 0,
        totalRevenue: 0,
        outstandingPayments: 0,
        activeGuests: 0,
        monthly: { bookings: 0, revenue: 0 }
      });
      setUpcomingBookings(bookingsRes.data || []);
      setRevenueData(revenueRes.data || []);
      setBookingStatusData(statusRes.data?.data || statusRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    { 
      title: 'Total Bookings', 
      value: metrics?.totalBookings || 0, 
      icon: FiCalendar, 
      color: 'from-gold-600 to-gold-500',
      change: '+12.5%'
    },
    { 
      title: 'Total Revenue', 
      value: `${(metrics?.totalRevenue || 0).toLocaleString()}`, 
      icon: FiDollarSign, 
      color: 'from-green-600 to-green-500',
      change: '+8.3%'
    },
    { 
      title: 'Outstanding Payments', 
      value: `${(metrics?.outstandingPayments || 0).toLocaleString()}`, 
      icon: FiTrendingUp, 
      color: 'from-red-600 to-red-500',
      change: '-3.2%'
    },
    { 
      title: 'Active Guests', 
      value: metrics?.activeGuests || 0, 
      icon: FiUsers, 
      color: 'from-blue-600 to-blue-500',
      change: '+5.7%'
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-luxury font-bold text-gold-500">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your resort management system</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-10 h-10 text-gold-500" />
                <span className={`text-sm font-semibold ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
              <p className="text-3xl font-bold text-gray-100 mt-2">{metric.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card 
          title="Revenue Performance" 
          subtitle="Track your revenue over time"
          headerAction={
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="input-luxury text-sm py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          }
        >
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #D4AF37' }}
                  labelStyle={{ color: '#FFD700' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No revenue data available
            </div>
          )}
        </Card>

        {/* Booking Status */}
        <Card title="Booking Status" subtitle="Current booking distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Array.isArray(bookingStatusData) ? bookingStatusData : []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(Array.isArray(bookingStatusData) ? bookingStatusData : []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #D4AF37' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card title="Upcoming Bookings" subtitle="Next 5 bookings scheduled">
        <div className="overflow-x-auto">
          <table className="table-luxury">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Resort</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="font-medium text-gray-100">{booking.guestName}</td>
                    <td>{booking.resort?.name}</td>
                    <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge-${booking.status === 'Confirmed' ? 'green' : 'gold'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="font-semibold text-gold-500">${booking.totalAmount?.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-400 py-8">
                    No upcoming bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;