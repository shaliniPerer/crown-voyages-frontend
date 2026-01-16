import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiUsers, FiFileText, FiFile, FiDownload, FiBarChart2 } from 'react-icons/fi';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { dashboardApi } from '../api/dashbaordApi';
import { billingApi } from '../api/billingApi';
import { analyticsApi } from '../api/analyticsApi';
import { toast } from 'react-toastify';
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
    paidInvoicesCount: 0,
    paidInvoicesValue: 0,
    monthly: {
      bookings: 0,
      revenue: 0
    }
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [resortAnalysisData, setResortAnalysisData] = useState([]);
  const [roomAnalysisData, setRoomAnalysisData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [resortPeriod, setResortPeriod] = useState('all');
  const [roomPeriod, setRoomPeriod] = useState('all');
  const [userPeriod, setUserPeriod] = useState('all');
  const [voucherPeriod, setVoucherPeriod] = useState('monthly');
  const [revenueData, setRevenueData] = useState([]);
  const [voucherTrendsData, setVoucherTrendsData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchResortAnalysis();
  }, [resortPeriod]);

  useEffect(() => {
    fetchRoomAnalysis();
  }, [roomPeriod]);

  useEffect(() => {
    fetchUserAnalysis();
  }, [userPeriod]);

  useEffect(() => {
    fetchVoucherTrends();
  }, [voucherPeriod]);

  useEffect(() => {
    fetchRevenueAnalysis();
  }, []);

  const fetchVoucherTrends = async () => {
    try {
      const res = await dashboardApi.getVoucherTrends(voucherPeriod);
      setVoucherTrendsData(res.data.data || []);
    } catch (error) {
       console.error('Error fetching voucher trends:', error);
    }
  };

  const fetchRevenueAnalysis = async () => {
    try {
      const res = await dashboardApi.getRevenueChart();
      setRevenueData(res.data.data || []);
    } catch (error) {
       console.error('Error fetching revenue analysis:', error);
    }
  };

  const fetchResortAnalysis = async () => {
    try {
      const res = await dashboardApi.getResortAnalysis(resortPeriod);
      setResortAnalysisData(res.data.data || []);
    } catch (error) {
       console.error('Error fetching resort analysis:', error);
    }
  };

  const fetchRoomAnalysis = async () => {
    try {
      const res = await dashboardApi.getRoomAnalysis(roomPeriod);
      setRoomAnalysisData(res.data.data || []);
    } catch (error) {
       console.error('Error fetching room analysis:', error);
    }
  };

  const fetchUserAnalysis = async () => {
    try {
      const res = await dashboardApi.getUserAnalysis(userPeriod);
      setUserData(res.data.data || []);
    } catch (error) {
       console.error('Error fetching user analysis:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, bookingsRes, statusRes] = await Promise.all([
        dashboardApi.getMetrics().catch(err => { console.error('Metrics Error:', err); return { data: { data: {} } }; }),
        dashboardApi.getUpcomingBookings({ limit: 5 }).catch(err => { console.error('Bookings Error:', err); return { data: [] }; }),
        dashboardApi.getLeadStatus().catch(err => { console.error('Status Error:', err); return { data: [] }; })
      ]);

      const extractedMetrics = metricsRes.data?.data || metricsRes.data;
      console.log('Dashboard Data Raw:', { metricsRes, extractedMetrics });
      
      if (extractedMetrics) {
        setMetrics(prev => ({ ...prev, ...extractedMetrics }));
      }
      
      setUpcomingBookings(bookingsRes.data?.data || bookingsRes.data || []);
      setBookingStatusData(statusRes.data?.data || statusRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Could not connect to server for latest metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType, periodType) => {
    try {
      toast.info(`Preparing ${reportType} report...`);
      const response = await analyticsApi.exportToPDF(reportType, { period: periodType });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${periodType}.pdf`;
      link.click();
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };
  
  const metricCards = [
    { 
      title: 'Receipts Totals', 
      value: `$${(metrics?.totalReceiptValue || 0).toLocaleString()}`, 
      icon: FiDollarSign, 
      color: 'from-blue-600 to-blue-500',
      change: `Count: ${metrics?.totalReceiptCount || 0}`
    },
    { 
      title: 'Outstanding Balances', 
      value: `$${(metrics?.outstandingPayments || 0).toLocaleString()}`, 
      icon: FiFileText, 
      color: 'from-red-600 to-red-500', 
      change: 'Due from Clients'
    },
    { 
      title: 'Full Payments', 
      value: metrics?.paidInvoicesCount || 0, 
      icon: FiFileText, 
      color: 'from-green-600 to-green-500',
      change: `Val: $${(metrics?.paidInvoicesValue || 0).toLocaleString()}`
    },
    { 
      title: 'Total Sales (Full)', 
      value: `$${(metrics?.totalInvoiceValue || 0).toLocaleString()}`, 
      icon: FiDollarSign, 
      color: 'from-gold-600 to-gold-500',
      change: `Total Invoices: ${metrics?.totalInvoiceCount || 0}`
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">Dashboard</h1>
          <p className="text-gray-900 mt-1">Overview of your resort management system</p>
        </div>
        {/* <div className="flex flex-wrap gap-2">
           <div className="flex items-center bg-white border border-gold-800/30 rounded-lg p-1.5 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 px-2 border-r border-gold-800/20 mr-2 uppercase tracking-widest">Global Reports</span>
              <div className="flex gap-1">
                {[
                  { label: 'Daily', period: 'daily' },
                  { label: 'Weekly', period: 'weekly' },
                  { label: 'Monthly', period: 'monthly' },
                  { label: 'Annually', period: 'annually' },
                  { label: 'All Time', period: 'all' }
                ].map((item) => (
                  <button 
                    key={item.period}
                    onClick={() => handleDownloadReport('booking', item.period)} 
                    className="text-[10px] uppercase font-bold px-2.5 py-1 text-gold-700 hover:bg-gold-50 rounded border border-transparent hover:border-gold-800/20 transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
           </div>
        </div> */}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <p className="text-xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-400 text-sm font-medium">{metric.title2}</h3>
                        <p className="text-xl font-bold text-gray-100 mt-1">{metric.value2}</p>
                    </div>
                 </div>
              ) : (
                <>
                  <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
                  <p className="text-3xl font-bold text-gray-9
                  00 mt-2">{metric.value}</p>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Team Performance Analysis (replaced Financial Summary) */}
      <Card className="border-gold-800/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FiUsers className="text-gold-500 w-5 h-5"/>
            <h2 className="text-lg font-bold text-gray-900">User Performance Analysis</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDownloadReport('user-performance', userPeriod)}
              className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
              title="Download Team Report"
            >
              <FiDownload />
            </button>
            <select 
              value={userPeriod} 
              onChange={(e) => setUserPeriod(e.target.value)}
              className="input-luxury text-sm py-1 px-3 w-32"
            >
              <option value="all">All Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>
        
        {userData.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={userData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #D4AF37', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value, name) => {
                      if (name.includes("Amount") || name.includes("Value")) return [`$${value.toLocaleString()}`, name];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar yAxisId="left" dataKey="conversions" name="Conversions" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="fullyPaid" name="Fully Paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="totalPaid" name="Revenue ($)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 font-semibold text-gray-500">USER</th>
                    <th className="py-2 font-semibold text-gray-500 text-center">CONV.</th>
                    <th className="py-2 font-semibold text-gray-500 text-center">FULL PAID</th>
                    <th className="py-2 font-semibold text-gray-500 text-right">REVENUE ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map((u, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold uppercase overflow-hidden">
                              {u.name.substring(0, 1)}
                           </div>
                           <div>
                              <p className="font-medium text-gray-900">{u.name}</p>
                              <p className="text-[10px] text-gray-400 capitalize">{u.role}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-3 text-center text-gold-600 font-bold">{u.conversions}</td>
                      <td className="py-3 text-center text-green-600 font-bold">{u.fullyPaid}</td>
                      <td className="py-3 text-right text-gray-700 font-medium">${(u.totalPaid || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 bg-gray-50/5 rounded-lg border border-dashed border-gray-200">
            No team activity data available
          </div>
        )}
      </Card>

      {/* NEW: Operational Document Trends */}
      <Card className="border-gold-800/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FiBarChart2 className="text-gold-500 w-5 h-5"/>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Upcoming Document Trends</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Based on Check-in Dates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDownloadReport('operational-trends', 'all')}
              className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
              title="Download Operational Report"
            >
              <FiDownload />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #D4AF37', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="leadCount" name="New Leads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quotationCount" name="Quotations" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoiceCount" name="Invoices" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detailed Breakdown</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 font-semibold text-gray-500">DATE</th>
                  <th className="py-2 font-semibold text-gray-500 text-center">LEADS</th>
                  <th className="py-2 font-semibold text-gray-500 text-center">QUOTES</th>
                  <th className="py-2 font-semibold text-gray-500 text-center">INVOICES</th>
                  <th className="py-2 font-semibold text-gray-500 text-right">INV. VALUE</th>
                </tr>
              </thead>
              <tbody>
                {(revenueData || []).slice(0, 10).map((d, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="py-3 text-center text-blue-600 font-bold">{d.leadCount || 0}</td>
                    <td className="py-3 text-center text-purple-600 font-bold">{d.quotationCount || 0}</td>
                    <td className="py-3 text-center text-green-600 font-bold">{d.invoiceCount || 0}</td>
                    <td className="py-3 text-right text-gray-700 font-medium">${(d.invoice || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* NEW: Voucher Trends (Confirmed Bookings)
      <Card className="border-gold-800/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FiFile className="text-gold-500 w-5 h-5"/>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Voucher Trends</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tracking Confirmed Vouchers Over Time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={voucherPeriod} 
              onChange={(e) => setVoucherPeriod(e.target.value)}
              className="input-luxury text-sm py-1 px-3 w-32"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={voucherTrendsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #D4AF37', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="vouchers" name="Confirmed Vouchers" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              <Bar dataKey="amount" name="Booking Value ($)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card> */}

      {/* Resort & Pipeline Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resort Performance Analysis */}
        <Card className="border-gold-800/30">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="text-gold-500 w-5 h-5"/>
              <h2 className="text-lg font-bold text-gray-900">Resorts Analysis</h2>
            </div>
            <div className="flex items-center gap-2">
              
              <button 
                onClick={() => handleDownloadReport('resort-analysis', resortPeriod)}
                className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                title="Download Resort Report"
              >
                <FiDownload />
              </button>
              <select 
                value={resortPeriod} 
                onChange={(e) => setResortPeriod(e.target.value)}
                className="input-luxury text-sm py-1 px-3 w-32"
              >
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          
          {resortAnalysisData.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resortAnalysisData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={60}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #D4AF37', borderRadius: '8px', fontSize: '12px' }}
                      cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
                      formatter={(value, name) => {
                        if (name === "Successful Conversions") return [value, name];
                        return [`$${value.toLocaleString()}`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="receipts" name="Successful Conversions" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalValue" name="Total Value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="paid" name="Paid Amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Resort Detail Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 font-semibold text-gray-500">RESORT</th>
                      <th className="py-2 font-semibold text-gray-500 text-center">CONV.</th>
                      <th className="py-2 font-semibold text-gray-500 text-right">TOTAL ($)</th>
                      <th className="py-2 font-semibold text-gray-500 text-right">PAID ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resortAnalysisData.slice(0, 5).map((resort, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2">
                          <p className="font-medium text-gray-900">{resort.name}</p>
                        </td>
                        <td className="py-2 text-center text-gold-600 font-bold">{resort.receipts}</td>
                        <td className="py-2 text-right text-gray-700">${(resort.totalValue || 0).toLocaleString()}</td>
                        <td className="py-2 text-right text-green-600">${(resort.paid || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-50/5 rounded-lg border border-dashed border-gray-200">
              No data available
            </div>
          )}
        </Card>

        {/* Room Performance Analysis */}
        <Card className="border-gold-800/30">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="text-gold-500 w-5 h-5"/>
              <h2 className="text-lg font-bold text-gray-900">Room Analysis</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleDownloadReport('room-analysis', roomPeriod)}
                className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                title="Download Room Report"
              >
                <FiDownload />
              </button>
              <select 
                value={roomPeriod} 
                onChange={(e) => setRoomPeriod(e.target.value)}
                className="input-luxury text-sm py-1 px-3 w-32"
              >
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          
          {roomAnalysisData.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roomAnalysisData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={60}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #D4AF37', borderRadius: '8px', fontSize: '12px' }}
                      cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
                      formatter={(value, name) => {
                        if (name === "Successful Conversions") return [value, name];
                        return [`$${value.toLocaleString()}`, name];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return `${label} (${payload[0].payload.resort})`;
                        }
                        return label;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="receipts" name="Successful Conversions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalValue" name="Total Value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="paid" name="Paid Amount" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table view for "any details" */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 font-semibold text-gray-500">ROOM / RESORT</th>
                      <th className="py-2 font-semibold text-gray-500 text-center">CONV.</th>
                      <th className="py-2 font-semibold text-gray-500 text-right">TOTAL ($)</th>
                      <th className="py-2 font-semibold text-gray-500 text-right">PAID ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomAnalysisData.slice(0, 5).map((room, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2">
                          <p className="font-medium text-gray-900">{room.name}</p>
                          <p className="text-[10px] text-gray-400">{room.resort}</p>
                        </td>
                        <td className="py-2 text-center text-purple-600 font-bold">{room.receipts}</td>
                        <td className="py-2 text-right text-gray-700">${(room.totalValue || 0).toLocaleString()}</td>
                        <td className="py-2 text-right text-green-600">${(room.paid || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-50/5 rounded-lg border border-dashed border-gray-200">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Bookings Overview (Replaces Arrivals Section) */}
      <Card 
        title="Upcoming Bookings Overview" 
        subtitle="Detailed tracking of Quotations and Invoices for upcoming check-ins"
        className="border-gold-800/30"
      >
        <div className="overflow-x-auto min-h-[300px]">
          {upcomingBookings?.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 uppercase tracking-wider text-gray-500 font-semibold bg-gray-50/50">
                  <th className="py-4 px-3">Check-In</th>
                  <th className="py-4 px-3">Guest / Booking</th>
                  <th className="py-4 px-3">Resort / Room</th>
                  <th className="py-4 px-3 text-center">Quotation</th>
                  <th className="py-4 px-3 text-center">Invoice / Payment</th>
                  <th className="py-4 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingBookings.map((booking, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-gold-600 text-sm">
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {Math.max(0, Math.ceil((new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60 * 24)))} days left
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-sm">{booking.guestName}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gold-100 text-gold-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-mono">{booking.bookingNumber}</span>
                          <span className={`px-1 rounded text-[8px] font-medium border ${
                            booking.type === 'Lead' ? 'border-purple-200 text-purple-500' : 'border-blue-200 text-blue-500'
                          }`}>
                            {booking.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div>
                        <p className="font-medium text-gray-700">{booking.resort}</p>
                        <p className="text-[10px] text-gray-400 italic">{booking.room}</p>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center">
                      {booking.quotation ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            booking.quotation.status === 'Accepted' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                            {booking.quotation.status}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold">
                            ${(booking.quotation.finalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">No Quotation</span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-center">
                      {booking.invoice ? (
                        <div className="w-24 mx-auto space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`font-bold ${booking.invoice.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                              {booking.invoice.status}
                            </span>
                            <span className="text-gray-400">{Math.round((booking.invoice.paidAmount / (booking.invoice.finalAmount || 1)) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${booking.invoice.status === 'Paid' ? 'bg-green-500' : 'bg-gold-500'}`} 
                              style={{ width: `${(booking.invoice.paidAmount / (booking.invoice.finalAmount || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">No Invoice</span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className={`text-sm font-bold ${booking.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ${(booking.balance || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <FiCalendar className="w-12 h-12 opacity-10 mb-2 font-thin"/>
              <p className="italic">No upcoming bookings found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Booking Distribution */}
        <Card title="Booking Distribution" className="lg:col-span-2">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Array.isArray(bookingStatusData) ? bookingStatusData : []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
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
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {(Array.isArray(bookingStatusData) ? bookingStatusData : []).map((status, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{status.name}</p>
                        <p className="text-lg font-bold text-gray-900">{status.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiDownload className="text-gold-500" />
                    Download pipeline reports
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['daily', 'weekly', 'monthly', 'annually', 'all'].map((period) => (
                      <button
                        key={period}
                        onClick={() => handleDownloadReport('operational-trends', period)}
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-gold-800/30 text-gold-700 hover:bg-gold-50 rounded transition-colors"
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      
    </div>
  );
};

export default Dashboard;