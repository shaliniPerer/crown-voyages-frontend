import { useState, useEffect } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { analyticsApi } from '../api/analyticsApi';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [period, setPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('booking');
  const [bookingData, setBookingData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period, reportType]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getBookingReports({ period });
      setBookingData(response.data.bookingTrends || []);
      setRevenueData(response.data.revenueTrends || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = format === 'pdf' 
        ? await analyticsApi.exportToPDF(reportType, { period })
        : await analyticsApi.exportToExcel(reportType, { period });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${period}.${format}`;
      link.click();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const summaryStats = [
    { label: 'Total Bookings', value: '1,234', change: '+12%' },
    { label: 'Total Revenue', value: '$456,789', change: '+18%' },
    { label: 'Avg. Booking Value', value: '$370', change: '+5%' },
    { label: 'Conversion Rate', value: '68%', change: '+3%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">Analytics</h1>
          <p className="text-gray-400 mt-1">Detailed reports and insights</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="small" onClick={() => handleExport('pdf')} icon={FiFileText}>
            Export PDF
          </Button>
          <Button variant="outline" size="small" onClick={() => handleExport('excel')} icon={FiDownload}>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="input-luxury w-full"
            >
              <option value="booking">Booking Report</option>
              <option value="revenue">Revenue Report</option>
              <option value="payment">Payment Report</option>
              <option value="customer">Customer Analytics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="input-luxury w-full"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
            <input type="date" className="input-luxury w-full" />
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.label}</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card title="Booking Trends" subtitle={`${period} overview`}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData.length > 0 ? bookingData : [
              { name: 'Jan', bookings: 65 },
              { name: 'Feb', bookings: 78 },
              { name: 'Mar', bookings: 90 },
              { name: 'Apr', bookings: 81 },
              { name: 'May', bookings: 95 },
              { name: 'Jun', bookings: 110 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #D4AF37' }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="#FFD700" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Trends */}
        <Card title="Revenue Trends" subtitle={`${period} performance`}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData.length > 0 ? revenueData : [
              { name: 'Jan', revenue: 24000 },
              { name: 'Feb', revenue: 29000 },
              { name: 'Mar', revenue: 33000 },
              { name: 'Apr', revenue: 30000 },
              { name: 'May', revenue: 35000 },
              { name: 'Jun', revenue: 41000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #D4AF37' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card title="Detailed Report" subtitle="Complete breakdown of metrics">
        <div className="overflow-x-auto">
          <table className="table-luxury">
            <thead>
              <tr>
                <th>Period</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Avg. Value</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>January 2025</td>
                <td>156</td>
                <td className="text-gold-500 font-semibold">$57,840</td>
                <td>$371</td>
                <td><span className="badge-green">+12%</span></td>
              </tr>
              <tr>
                <td>February 2025</td>
                <td>189</td>
                <td className="text-gold-500 font-semibold">$70,083</td>
                <td>$371</td>
                <td><span className="badge-green">+21%</span></td>
              </tr>
              <tr>
                <td>March 2025</td>
                <td>203</td>
                <td className="text-gold-500 font-semibold">$75,313</td>
                <td>$371</td>
                <td><span className="badge-green">+7%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;