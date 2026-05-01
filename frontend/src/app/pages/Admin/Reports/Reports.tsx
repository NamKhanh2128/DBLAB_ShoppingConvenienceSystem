import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { PageHeader } from "../../../components/common/PageHeader";
import { StatCard } from "../../../components/common/StatCard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const stats = [
  { title: "Tổng doanh thu", value: "15.8M", change: "+18%", trend: "up", icon: DollarSign, gradient: "from-green-500 to-green-600" },
  { title: "Đơn hàng", value: "2,847", change: "+12%", trend: "up", icon: ShoppingBag, gradient: "from-[var(--gold)] to-[var(--gold-light)]" },
  { title: "Người dùng mới", value: "456", change: "+8%", trend: "up", icon: Users, gradient: "from-[var(--purple-deep)] to-[var(--purple-light)]" },
  { title: "Tỷ lệ chuyển đổi", value: "68%", change: "+5%", trend: "up", icon: TrendingUp, gradient: "from-blue-500 to-blue-600" },
];

const revenueData = [
  { month: "T1", revenue: 4200, orders: 890, users: 1200 },
  { month: "T2", revenue: 5800, orders: 1120, users: 1800 },
  { month: "T3", revenue: 7200, orders: 1450, users: 2100 },
  { month: "T4", revenue: 9800, orders: 1890, users: 2847 },
  { month: "T5", revenue: 11500, orders: 2200, users: 3200 },
  { month: "T6", revenue: 15800, orders: 2847, users: 3850 },
];

const categoryData = [
  { name: "Rau củ", value: 4200, color: "var(--success)" },
  { name: "Thịt", value: 3800, color: "var(--gold)" },
  { name: "Cá", value: 2900, color: "var(--purple-deep)" },
  { name: "Trứng & Sữa", value: 2100, color: "var(--food-orange)" },
  { name: "Gia vị", value: 1500, color: "#3B82F6" },
  { name: "Khác", value: 1300, color: "#8B5CF6" },
];

const topUsers = [
  { name: "Nguyễn Văn A", orders: 45, revenue: "2.8M", avatar: "NA" },
  { name: "Trần Thị B", orders: 38, revenue: "2.3M", avatar: "TB" },
  { name: "Lê Văn C", orders: 32, revenue: "1.9M", avatar: "LC" },
  { name: "Phạm Thị D", orders: 28, revenue: "1.6M", avatar: "PD" },
  { name: "Hoàng Văn E", orders: 25, revenue: "1.4M", avatar: "HE" },
];

export function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo & Phân tích"
        description="Tổng quan hiệu suất và xu hướng hệ thống"
        icon={BarChart3}
        action={
          <div className="flex items-center gap-3">
            <Select defaultValue="30days">
              <SelectTrigger className="w-48 h-10 rounded-[var(--radius-sm)] border-[var(--border-light)] bg-white">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent className="rounded-[var(--radius-sm)]">
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="30days">30 ngày qua</SelectItem>
                <SelectItem value="90days">90 ngày qua</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold">
              <Calendar className="w-4 h-4 mr-2" strokeWidth={2.5} />
              Xuất báo cáo
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend as "up" | "down"}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth animate-slide-up bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-[var(--text-dark)]">Tăng trưởng doanh thu</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">6 tháng gần nhất (Triệu VNĐ)</p>
            </div>
            <Badge className="bg-gradient-purple text-white rounded-full px-4 py-1.5 font-semibold shadow-md">
              <TrendingUp className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
              +276%
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--purple-deep)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--purple-deep)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" style={{ fontSize: "12px", fontWeight: 600 }} />
              <YAxis stroke="var(--text-muted)" style={{ fontSize: "12px", fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-card)",
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--purple-deep)"
                strokeWidth={3}
                fill="url(#colorRevenue)"
                name="Doanh thu (K)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders & Users Chart */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth animate-slide-up bg-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-[var(--text-dark)] mb-6">Đơn hàng & Người dùng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" style={{ fontSize: "12px", fontWeight: 600 }} />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: "12px", fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 600,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                <Line type="monotone" dataKey="orders" stroke="var(--gold)" strokeWidth={3} dot={{ fill: "var(--gold)", r: 5 }} name="Đơn hàng" />
                <Line type="monotone" dataKey="users" stroke="var(--purple-deep)" strokeWidth={3} dot={{ fill: "var(--purple-deep)", r: 5 }} name="Người dùng" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth animate-slide-up bg-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-[var(--text-dark)] mb-6">Danh mục bán chạy</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis type="number" stroke="var(--text-muted)" style={{ fontSize: "12px", fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" style={{ fontSize: "12px", fontWeight: 600 }} width={100} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {categoryData.map((entry, index) => (
                    <Bar key={`bar-${index}`} dataKey="value" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth animate-slide-up bg-white">
        <CardContent className="p-6">
          <h3 className="text-xl font-black text-[var(--text-dark)] mb-6">Top người dùng</h3>
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth group"
              >
                <div className="w-10 h-10 bg-gradient-purple text-white rounded-full flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <div className="w-11 h-11 bg-gradient-gold text-white rounded-[10px] flex items-center justify-center font-bold shadow-md">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--text-dark)]">{user.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{user.orders} đơn hàng</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[var(--purple-deep)]">{user.revenue}</p>
                  <p className="text-xs text-[var(--text-muted)] font-semibold">Doanh thu</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
