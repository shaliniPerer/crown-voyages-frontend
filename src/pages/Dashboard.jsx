import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiTrendingUp, FiUsers, FiFileText, FiFile } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import Card from '../components/common/Card';
import { dashboardApi } from '../api/dashbaordApi';
import { billingApi } from '../api/billingApi';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    totalGuests: 0,
    totalRevenue: 0,
    totalQuotationValue: 0,
    totalInvoiceValue: 0,
    totalReceiptValue: 0,
    totalQuotationCount: 0,
    totalInvoiceCount: 0,
    totalReceiptCount: 0,
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
  const [statsPeriod, setStatsPeriod] = useState('monthly');
  const [financialStats, setFinancialStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  useEffect(() => {
    fetchFinancialStats();
  }, [statsPeriod]);

  const fetchFinancialStats = async () => {
    try {
      const res = await billingApi.getStats(statsPeriod);
      setFinancialStats(res.data.data);
    } catch (error) {
       console.error('Error fetching financial stats:', error);
    }
  };

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
        totalGuests: 0,
        totalRevenue: 0,
        totalQuotationValue: 0,
        totalInvoiceValue: 0,
        totalReceiptValue: 0,
        totalQuotationCount: 0,
        totalInvoiceCount: 0,
        totalReceiptCount: 0,
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
  
  const financialData = [
    { name: 'Quotations', value: metrics.totalQuotationValue || 0, count: metrics.totalQuotationCount || 0, fill: '#8B5CF6' },
    { name: 'Invoices', value: metrics.totalInvoiceValue || 0, count: metrics.totalInvoiceCount || 0, fill: '#EC4899' },
    { name: 'Receipts', value: metrics.totalReceiptValue || 0, count: metrics.totalReceiptCount || 0, fill: '#10B981' }
  ];

  const metricCards = [
    { 
      title: 'Total Bookings', 
      value: metrics?.totalBookings || 0, 
      icon: FiCalendar, 
      color: 'from-gold-600 to-gold-500',
      change: `This month: ${metrics?.monthly?.bookings || 0}`
    },
    { 
      title: 'Total Guests', 
      value: metrics?.totalGuests || 0, 
      icon: FiUsers, 
      color: 'from-blue-600 to-blue-500', 
      change: `Active: ${metrics?.activeGuests || 0}`
    },
    { 
      title: 'Total Revenue', 
      value: `$${(metrics?.totalRevenue || 0).toLocaleString()}`, 
      icon: FiDollarSign, 
      color: 'from-green-600 to-green-500',
      change: `Count: ${metrics?.totalReceiptCount || 0}`
    },
    { 
      title: 'Quotation Value', 
      title2: 'Invoice Value',
      value: `$${(metrics?.totalQuotationValue || 0).toLocaleString()}`, 
      value2: `$${(metrics?.totalInvoiceValue || 0).toLocaleString()}`,
      icon: FiFileText, 
      color: 'from-purple-600 to-purple-500',
      change: `Counts: ${metrics?.totalQuotationCount || 0} / ${metrics?.totalInvoiceCount || 0}`
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-luxury font-bold text-gold-500">Dashboard</h1>
        <p className="text-gray-900 mt-1">Overview of your resort management system</p>
      </div>

      {/* Metric Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-10 h-10 text-gold-500" />
                <span className={`text-sm font-semibold ${metric.change.startsWith('+') ? 'text-green-400' : metric.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
                  {metric.change}
                </span>
              </div>
              {metric.title2 ? (
                 <div className="flex justify-between gap-2">
                    <div>
                        <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
                        <p className="text-xl font-bold text-gray-100 mt-1">{metric.value}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-400 text-sm font-medium">{metric.title2}</h3>
                        <p className="text-xl font-bold text-gray-100 mt-1">{metric.value2}</p>
                    </div>
                 </div>
              ) : (
                <>
                  <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
                  <p className="text-3xl font-bold text-gray-100 mt-2">{metric.value}</p>
                </>
              )}
            </div>
          </Card>
        ))}
      </div> */}

      {/* Financial Analysis */}
      {financialStats && (
        <Card className="border-gold-800/30">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                 <FiDollarSign className="text-gold-500 w-5 h-5"/>
                 <h2 className="text-lg font-bold text-gray-900">Financial Summary</h2>
             </div>
             <select 
                value={statsPeriod} 
                onChange={(e) => setStatsPeriod(e.target.value)}
                className="input-luxury text-sm py-1 px-3 w-40"
             >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
             </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white/50 p-4 rounded-lg border border-gray-700 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 opacity-5 rounded-bl-full -mr-4 -mt-4"></div>
                <p className="text-gray-900 text-sm font-uppercase tracking-wider font-medium mb-2">QUOTATIONS</p>
                <div className="flex justify-between items-end relative z-10">
                    <span className="text-2xl font-bold text-purple-400">${(financialStats.quotations?.total || 0).toLocaleString()}</span>
                    <span className="text-sm bg-purple-300/10 text-purple-900 px-2 py-1 rounded-full border border-purple-500/20">{financialStats.quotations?.count || 0} docs</span>
                </div>
             </div>
             <div className="bg-white/50 p-4 rounded-lg border border-gray-700 relative overflow-hidden group hover:border-pink-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-500 opacity-5 rounded-bl-full -mr-4 -mt-4"></div>
                <p className="text-gray-900 text-sm font-uppercase tracking-wider font-medium mb-2">INVOICES</p>
                <div className="flex justify-between items-end relative z-10">
                    <span className="text-2xl font-bold text-pink-400">${(financialStats.invoices?.total || 0).toLocaleString()}</span>
                    <span className="text-sm bg-pink-300/10 text-pink-900 px-2 py-1 rounded-full border border-pink-500/20">{financialStats.invoices?.count || 0} docs</span>
                </div>
             </div>
             <div className="bg-gray-white/50 p-4 rounded-lg border border-gray-700 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 opacity-5 rounded-bl-full -mr-4 -mt-4"></div>
                <p className="text-gray-900 text-sm font-uppercase tracking-wider font-medium mb-2">RECEIPTS</p>
                <div className="flex justify-between items-end relative z-10">
                    <span className="text-2xl font-bold text-green-400">${(financialStats.receipts?.total || 0).toLocaleString()}</span>
                    <span className="text-sm bg-green-300/10 text-green-900 px-2 py-1 rounded-full border border-green-500/20">{financialStats.receipts?.count || 0} docs</span>
                </div>
             </div>
          </div>
        </Card>
      )}

      {/* Financial Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Financial Overview" subtitle="Pipeline Volume (Quotations vs Invoices vs Receipts)" className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `$${value/1000}k`} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #D4AF37' }}
                    cursor={{fill: '#2A2A2A'}}
                    formatter={(value, name, props) => {
                      if (name === 'value') return [`$${value.toLocaleString()}`, 'Amount'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                         const item = financialData[label]; 
                         if(item) return `${item.name} (${item.count})`;
                         return label;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
      </div> */}

      {/* Analytic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        {/* <Card 
          title="Revenue Trends" 
          subtitle="Financial performance over time"
          headerAction={
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="input-luxury text-sm py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          }
        >
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #D4AF37' }}
                  labelStyle={{ color: '#FFD700' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Receipts" stroke="#10B981" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="quotation" name="Quotations" stroke="#8B5CF6" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="invoice" name="Invoices" stroke="#EC4899" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </Card> */}

        {/* Booking Volume */}
        {/* <Card 
          title="Booking Volume" 
          subtitle="Number of bookings over time"
          headerAction={
            <div className="text-sm text-gray-400 px-2 py-2">
                {period.charAt(0).toUpperCase() + period.slice(1)} View
            </div>
          }
        >
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #D4AF37' }}
                  cursor={{fill: '#2A2A2A'}}
                  labelStyle={{ color: '#FFD700' }}
                />
                <Legend />
                <Bar dataKey="bookingCount" name="Total Bookings" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </Card> */}

        {/* Booking Status */}
        <Card title="Booking Distribution"  className="lg:col-span-2">
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
                contentStyle={{ backgroundColor: 'white', border: '1px solid #D4AF37' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      
    </div>
  );
};

export default Dashboard;