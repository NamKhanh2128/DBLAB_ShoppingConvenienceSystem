import { useState } from "react";
import { Download, BarChart3, TrendingUp, Users, DollarSign, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { PageHeader } from "../../../components/common/PageHeader";
import { toast } from "../../../components/common/Toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAdmin } from "../../../context/AdminContext";

const categoryColors = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'];

export function AdminReports() {
  const [isExporting, setIsExporting] = useState(false);
  const { reportsStats, loading } = useAdmin();

  const handleExport = () => {
    setIsExporting(true);
    toast.info('Đang chuẩn bị tệp báo cáo PDF...');
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 1000);
  };

  if (loading || !reportsStats) {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--purple-deep)] mb-4" />
        <span className="text-[var(--text-muted)] text-lg font-medium">Đang tải báo cáo hệ thống...</span>
      </div>
    );
  }

  // Tính toán chỉ số tăng trưởng giữa tháng cuối cùng và tháng trước đó
  const getGrowth = (dataKey: 'spend' | 'waste') => {
    const trend = reportsStats.trend || [];
    if (trend.length < 2) return { percent: 0, isUp: true };
    const current = Number(trend[trend.length - 1]?.[dataKey] || 0);
    const previous = Number(trend[trend.length - 2]?.[dataKey] || 0);
    if (previous === 0) return { percent: 0, isUp: true };
    const diff = current - previous;
    const percent = Math.abs((diff / previous) * 100);
    return { percent, isUp: diff >= 0 };
  };

  const spendGrowth = getGrowth('spend');
  const wasteGrowth = getGrowth('waste');

  const spendVal = Number(reportsStats.kpis?.totalSystemSpend || 0);
  const wasteVal = Number(reportsStats.kpis?.totalSystemWaste || 0);
  const averageWasteRatio = spendVal > 0 ? (wasteVal / spendVal) * 100 : 0;

  // Format các số tiền thành dạng K (nghìn) trong biểu đồ
  const trendData = (reportsStats.trend || []).map((item: any) => ({
    ...item,
    spend: Math.round(Number(item.spend || 0)),
    waste: Math.round(Number(item.waste || 0))
  }));

  const categoryData = (reportsStats.categoryDistribution || []).map((item: any) => ({
    name: item.name || 'Khác',
    value: Number(item.value || 0)
  })).filter((c: any) => c.value > 0);

  const totalCategorySpend = categoryData.reduce((sum: number, it: any) => sum + it.value, 0);

  return (
    <div className="space-y-6 print:p-8 print:bg-white">
      <PageHeader
        title="Báo cáo hệ thống"
        description="Thống kê tổng quan chi tiêu đi chợ và lãng phí thực phẩm toàn hệ thống"
        icon={BarChart3}
        action={
          <div className="flex gap-3 print:hidden">
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
              {isExporting ? 'Đang xuất...' : 'Xuất PDF / In'}
            </Button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
         <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-12 h-12 bg-emerald-100 rounded-[12px] flex items-center justify-center">
                   <DollarSign className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
                 </div>
                 <div className={`flex items-center ${spendGrowth.isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2.5 py-1 rounded-full text-sm font-bold`}>
                   {spendGrowth.isUp ? <TrendingUp className="w-4 h-4 mr-1" strokeWidth={3} /> : <TrendingUp className="w-4 h-4 mr-1 rotate-180" strokeWidth={3} />}
                   {spendGrowth.percent.toFixed(1)}%
                 </div>
              </div>
              <p className="text-[var(--text-muted)] font-semibold text-sm mb-1">Tổng chi tiêu đi chợ</p>
              <h3 className="text-3xl font-black text-[var(--text-dark)]">{spendVal.toLocaleString()} ₫</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Toàn bộ hệ thống: {reportsStats.kpis?.totalGroups || 0} gia đình</p>
            </CardContent>
         </Card>

         <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-12 h-12 bg-red-100 rounded-[12px] flex items-center justify-center">
                   <AlertTriangle className="w-6 h-6 text-red-600" strokeWidth={2.5} />
                 </div>
                 <div className={`flex items-center ${!wasteGrowth.isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2.5 py-1 rounded-full text-sm font-bold`}>
                   {!wasteGrowth.isUp ? <TrendingUp className="w-4 h-4 mr-1 rotate-180" strokeWidth={3} /> : <TrendingUp className="w-4 h-4 mr-1" strokeWidth={3} />}
                   {wasteGrowth.percent.toFixed(1)}%
                 </div>
              </div>
              <p className="text-[var(--text-muted)] font-semibold text-sm mb-1">Tổng thực phẩm lãng phí</p>
              <h3 className="text-3xl font-black text-[var(--text-dark)]">{wasteVal.toLocaleString()} ₫</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Giá trị thực phẩm quá hạn</p>
            </CardContent>
         </Card>

         <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-12 h-12 bg-purple-100 rounded-[12px] flex items-center justify-center">
                   <Users className="w-6 h-6 text-[var(--purple-deep)]" strokeWidth={2.5} />
                 </div>
                 <div className="flex items-center text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-sm font-bold">
                   <TrendingUp className="w-4 h-4 mr-1" strokeWidth={3} />
                   +{(reportsStats.kpis?.totalUsers || 0) > 0 ? (100 / reportsStats.kpis.totalUsers).toFixed(1) : '0'}%
                 </div>
              </div>
              <p className="text-[var(--text-muted)] font-semibold text-sm mb-1">Tỉ lệ lãng phí hệ thống</p>
              <h3 className="text-3xl font-black text-[var(--text-dark)]">{averageWasteRatio.toFixed(1)}%</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Tổng {reportsStats.kpis?.totalUsers || 0} người dùng đăng ký</p>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Spend & Waste Area Chart */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden hover-lift transition-smooth">
          <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)] pb-4">
            <CardTitle className="text-lg font-black text-[var(--text-dark)]">Xu hướng chi tiêu & lãng phí hàng tháng</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[var(--text-muted)]">Chưa có xu hướng thời gian</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--purple-deep)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--purple-deep)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} ₫`, '']}
                      contentStyle={{ borderRadius: '12px', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-card)' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="spend" name="Tổng chi tiêu" stroke="var(--purple-deep)" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
                    <Area type="monotone" dataKey="waste" name="Tổng lãng phí" stroke="#EF4444" fillOpacity={1} fill="url(#colorWaste)" strokeWidth={2.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shopping Lists Daily Activity Chart */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden hover-lift transition-smooth">
          <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)] pb-4">
            <CardTitle className="text-lg font-black text-[var(--text-dark)]">Hoạt động đi chợ (7 Ngày qua)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsStats.activity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-card)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="new" name="Giỏ tạo mới" fill="var(--gold)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="active" name="Đã hoàn thành" fill="var(--purple-deep)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Spend Distribution */}
        <Card className="lg:col-span-2 border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden hover-lift transition-smooth animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)] pb-4">
            <CardTitle className="text-lg font-black text-[var(--text-dark)]">Tỉ trọng chi tiêu theo danh mục quầy hàng</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-center gap-10">
            {categoryData.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-muted)]">Chưa có dữ liệu chi tiêu quầy hàng</div>
            ) : (
              <>
                <div className="h-[250px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ₫`, 'Số tiền']} contentStyle={{ borderRadius: '12px', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-card)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[300px] flex-1">
                  {categoryData.map((item: any, index: number) => {
                    const color = categoryColors[index % categoryColors.length];
                    const percentage = totalCategorySpend > 0 ? Math.round((item.value / totalCategorySpend) * 100) : 0;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--card-bg)] hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-2.5">
                           <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                           <span className="font-bold text-[var(--text-dark)] text-sm">{item.name}</span>
                         </div>
                         <div className="text-right">
                           <span className="font-black text-gray-900 text-sm block">{item.value.toLocaleString()} ₫</span>
                           <span className="text-xs text-gray-400 font-bold">({percentage}%)</span>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Active Families Leaderboard */}
        <Card className="lg:col-span-2 border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden hover-lift transition-smooth">
          <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)] pb-4">
            <CardTitle className="text-lg font-black text-[var(--text-dark)]">Top 5 gia đình hoạt động tích cực nhất</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-muted)]">
                <thead className="text-xs text-[var(--text-dark)] uppercase bg-[var(--card-bg)] font-bold border-b border-[var(--border-light)]">
                  <tr>
                    <th className="px-6 py-4">Xếp hạng</th>
                    <th className="px-6 py-4">Nhóm gia đình</th>
                    <th className="px-6 py-4 text-center">Quy mô</th>
                    <th className="px-6 py-4 text-center">Danh sách hoàn thành</th>
                    <th className="px-6 py-4 text-right">Tổng chi tiêu đi chợ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {reportsStats.topFamilies.map((fam: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-[var(--purple-deep)]">#{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-[var(--text-dark)]">{fam.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 bg-purple-50 text-[var(--purple-deep)] font-semibold text-xs rounded-full border border-purple-100">
                          {fam.memberCount} thành viên
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{fam.completedLists} phiên</td>
                      <td className="px-6 py-4 text-right font-black text-[var(--purple-deep)] text-base">
                        {Number(fam.totalSpend || 0).toLocaleString()} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
