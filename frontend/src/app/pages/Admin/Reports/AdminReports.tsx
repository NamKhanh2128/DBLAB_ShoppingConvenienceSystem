import { useState } from "react";
import { Download, BarChart3, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { PageHeader } from "../../../components/common/PageHeader";
import { toast } from "../../../components/common/Toast";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const revenueData = [
  { month: 'T1', revenue: 45000000, profit: 32000000 },
  { month: 'T2', revenue: 52000000, profit: 38000000 },
  { month: 'T3', revenue: 61000000, profit: 46000000 },
  { month: 'T4', revenue: 58000000, profit: 41000000 },
  { month: 'T5', revenue: 75000000, profit: 54000000 },
  { month: 'T6', revenue: 89000000, profit: 67000000 },
];

const categoryData = [
  { name: 'Gói Basic', value: 45, color: 'var(--purple-light)' },
  { name: 'Gói Premium', value: 35, color: 'var(--purple-deep)' },
  { name: 'Gói Family', value: 20, color: 'var(--gold)' },
];

const userActivityData = [
  { day: 'Thứ 2', active: 1200, new: 180 },
  { day: 'Thứ 3', active: 1400, new: 220 },
  { day: 'Thứ 4', active: 1650, new: 280 },
  { day: 'Thứ 5', active: 1500, new: 210 },
  { day: 'Thứ 6', active: 2100, new: 350 },
  { day: 'Thứ 7', active: 2400, new: 450 },
  { day: 'CN', active: 2200, new: 390 },
];

export function AdminReports() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    toast.info('Đang chuẩn bị tệp báo cáo...');
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Báo cáo đã được tải xuống thành công!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo hệ thống"
        description="Phân tích và thống kê tổng quan hoạt động kinh doanh"
        icon={BarChart3}
        action={
          <div className="flex gap-3">
            <Select defaultValue="month">
              <SelectTrigger className="w-[150px] bg-white border-[var(--border-light)] rounded-[var(--radius-sm)] focus:ring-[var(--purple-deep)]">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent className="rounded-[var(--radius-sm)]">
                <SelectItem value="week">Tuần nay</SelectItem>
                <SelectItem value="month">Tháng nay</SelectItem>
                <SelectItem value="quarter">Quý nay</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-[var(--card-bg)] text-[var(--purple-deep)] border border-[var(--purple-light)] hover:bg-[var(--purple-light)] hover:text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold transition-all group"
            >
              <Download className={`w-5 h-5 mr-2 ${isExporting ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} strokeWidth={2.5} />
              {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
            </Button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
         <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth bg-white">
           <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-[12px] flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[var(--purple-deep)]" strokeWidth={2.5} />
                </div>
                <div className="flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-sm font-bold">
                  <TrendingUp className="w-4 h-4 mr-1" strokeWidth={3} />
                  +18.5%
                </div>
             </div>
             <p className="text-[var(--text-muted)] font-semibold text-sm mb-1">Tổng doanh thu</p>
             <h3 className="text-3xl font-black text-[var(--text-dark)]">380.0M đ</h3>
           </CardContent>
         </Card>

         <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth bg-white">
           <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-[12px] flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--food-orange)]" strokeWidth={2.5} />
                </div>
                <div className="flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-sm font-bold">
                  <TrendingUp className="w-4 h-4 mr-1" strokeWidth={3} />
                  +12.2%
                </div>
             </div>
             <p className="text-[var(--text-muted)] font-semibold text-sm mb-1">Thành viên mới</p>
             <h3 className="text-3xl font-black text-[var(--text-dark)]">1,850</h3>
           </CardContent>
         </Card>

         <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth bg-white">
           <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-[12px] flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div className="flex items-center text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-sm font-bold">
                  <TrendingUp className="w-4 h-4 mr-1 rotate-180" strokeWidth={3} />
                  -2.4%
                </div>
             </div>
             <p className="text-[var(--text-muted)] font-semibold text-sm mb-1">Tỉ lệ hủy gói</p>
             <h3 className="text-3xl font-black text-[var(--text-dark)]">4.2%</h3>
           </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Revenue Area Chart */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden hover-lift transition-smooth">
          <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)] pb-4">
            <CardTitle className="text-lg font-black text-[var(--text-dark)]">Doanh thu & Lợi nhuận (6 Tháng)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple-deep)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--purple-deep)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} đ`, '']}
                    contentStyle={{ borderRadius: '12px', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-card)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="var(--gold)" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Lợi nhuận" stroke="var(--purple-deep)" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Activity Bar Chart */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden hover-lift transition-smooth">
          <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)] pb-4">
            <CardTitle className="text-lg font-black text-[var(--text-dark)]">Người dùng hoạt động (Tuần)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-card)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="active" name="Hoạt động" fill="var(--purple-deep)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="new" name="Tạo mới" fill="var(--gold)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card className="lg:col-span-2 border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden hover-lift transition-smooth animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)] pb-4">
            <CardTitle className="text-lg font-black text-[var(--text-dark)]">Tỉ trọng Đăng ký Gói (Khách hàng)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="h-[250px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-card)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4 min-w-[200px]">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--card-bg)]">
                   <div className="flex items-center gap-3">
                     <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                     <span className="font-bold text-[var(--text-dark)]">{item.name}</span>
                   </div>
                   <span className="font-black" style={{ color: item.color }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
