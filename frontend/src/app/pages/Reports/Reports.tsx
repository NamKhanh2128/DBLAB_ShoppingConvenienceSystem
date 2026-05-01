import { TrendingUp, DollarSign, TrendingDown, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReports } from "../../hooks/useData";

const categoryColors = ['#22C55E', '#EF4444', '#F97316', '#3B82F6', '#A569BD'];

export function Reports() {
  const { reports, summary, loading } = useReports();

  const totalSpend = summary?.TongChiPhi || 0;
  const totalWaste = summary?.TongLangPhi || 0;
  const savings = Math.max(0, totalSpend * 0.2); // estimate

  // Build chart data from reports
  const monthlyData = reports.map((r: any) => ({
    month: r.TuanThang || '',
    expense: Math.round((r.TongChiPhi || 0) / 1000),
    waste: Math.round((r.TongLangPhi || 0) / 1000),
  }));

  const categoryData = [
    { name: 'Rau củ', value: 35, color: '#22C55E' },
    { name: 'Thịt cá', value: 30, color: '#EF4444' },
    { name: 'Trái cây', value: 20, color: '#F97316' },
    { name: 'Khác', value: 15, color: '#3B82F6' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--success)] mr-4" />
        <span className="text-[var(--text-muted)] text-lg">Đang tải báo cáo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Báo cáo chi tiêu</h1>
        <p className="text-gray-600 mt-1">Phân tích chi tiêu và tối ưu ngân sách gia đình</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm opacity-90">Tổng chi tháng này</span>
            </div>
            <p className="text-3xl font-bold">{totalSpend.toLocaleString()}₫</p>
            <Badge className="mt-2 bg-white/20 text-white">Tổng chi tiêu</Badge>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-sm opacity-90">Lãng phí tháng này</span>
            </div>
            <p className="text-3xl font-bold">{totalWaste.toLocaleString()}₫</p>
            <Badge className="mt-2 bg-white/20 text-white">Thực phẩm hết hạn</Badge>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm opacity-90">Tiết kiệm được</span>
            </div>
            <p className="text-3xl font-bold">{savings.toLocaleString()}₫</p>
            <Badge className="mt-2 bg-white/20 text-white">Ước tính</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Chi tiêu theo tháng</CardTitle>
            <CardDescription>So sánh chi tiêu và lãng phí (nghìn đồng)</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val: any) => `${val}k₫`} />
                  <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#22C55E" strokeWidth={2} />
                  <Line type="monotone" dataKey="waste" name="Lãng phí" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)]">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có dữ liệu báo cáo</p>
                  <p className="text-sm mt-1">Dữ liệu sẽ xuất hiện sau khi có giao dịch</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Phân bổ chi tiêu</CardTitle>
            <CardDescription>Chi tiêu theo danh mục (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      {reports.length > 0 && (
        <Card className="border-none shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Lịch sử báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
                  <div>
                    <p className="font-semibold text-[var(--text-dark)]">{r.TuanThang}</p>
                    <p className="text-sm text-[var(--text-muted)]">Lãng phí: {Number(r.TongLangPhi || 0).toLocaleString()}₫</p>
                  </div>
                  <p className="text-lg font-bold text-[var(--success)]">{Number(r.TongChiPhi || 0).toLocaleString()}₫</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
