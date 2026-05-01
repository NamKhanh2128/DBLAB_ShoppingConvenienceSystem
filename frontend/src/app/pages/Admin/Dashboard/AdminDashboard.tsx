import { useNavigate } from "react-router";
import { Users, Database, Activity, AlertCircle, TrendingUp, ShoppingBag, Clock, Shield, Ban, UserCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from "../../../components/common/PageHeader";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";

const monthlyData = [
  { month: 'T1', users: 1200, groups: 450 },
  { month: 'T2', users: 1800, groups: 680 },
  { month: 'T3', users: 2100, groups: 890 },
  { month: 'T4', users: 2847, groups: 1234 },
  { month: 'T5', users: 3200, groups: 1450 },
  { month: 'T6', users: 3850, groups: 1680 },
];

const activityData = [
  { name: "Đăng nhập", value: 450, color: "var(--purple-deep)" },
  { name: "Mua sắm", value: 320, color: "var(--gold)" },
  { name: "Công thức", value: 180, color: "var(--success)" },
  { name: "Báo cáo", value: 120, color: "var(--food-orange)" },
];

export function AdminDashboard() {
  const { users, auditLogs } = useAdmin();
  const navigate = useNavigate();

  const activeUsers = users.filter(u => u.status === "active").length;
  const bannedUsers = users.filter(u => u.status === "banned").length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const errorLogs = auditLogs.filter(l => l.status === "error").length;

  const stats = [
    { title: "Tổng người dùng", value: users.length.toLocaleString(), change: "+12%", trend: "up" as const, icon: Users, gradient: "from-[var(--purple-deep)] to-[var(--purple-light)]" },
    { title: "Đang hoạt động", value: activeUsers.toLocaleString(), change: `${Math.round(activeUsers/users.length*100)}%`, trend: "up" as const, icon: UserCheck, gradient: "from-green-500 to-green-400" },
    { title: "Bị cấm", value: bannedUsers.toLocaleString(), change: bannedUsers > 0 ? "Cần xem lại" : "Tốt", trend: bannedUsers > 0 ? "down" as const : "up" as const, icon: Ban, gradient: "from-red-500 to-red-600" },
    { title: "Lỗi hệ thống", value: errorLogs.toLocaleString(), change: errorLogs === 0 ? "Bình thường" : "Có lỗi", trend: errorLogs > 0 ? "down" as const : "up" as const, icon: AlertCircle, gradient: "from-orange-500 to-orange-400" },
  ];

  const recentUsers = [...users].sort((a, b) => b.joinDate.localeCompare(a.joinDate)).slice(0, 5);
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Admin Dashboard" description="Tổng quan và quản lý hệ thống" icon={Shield} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} change={s.change} trend={s.trend} icon={s.icon} gradient={s.gradient} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-[var(--text-dark)]">Tăng trưởng người dùng</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">6 tháng gần nhất</p>
              </div>
              <Badge className="bg-gradient-purple text-white rounded-full px-4 py-1.5 font-semibold shadow-md">
                <TrendingUp className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />+35%
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" style={{ fontSize: '12px', fontWeight: 600 }} />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px', fontWeight: 600 }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }} />
                <Line type="monotone" dataKey="users" stroke="var(--purple-deep)" strokeWidth={3} dot={{ fill: "var(--purple-deep)", r: 5 }} name="Người dùng" />
                <Line type="monotone" dataKey="groups" stroke="var(--gold)" strokeWidth={3} dot={{ fill: "var(--gold)", r: 5 }} name="Nhóm" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-[var(--text-dark)] mb-4">Phân bổ hoạt động</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={activityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                  {activityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {activityData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-dark)]">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[var(--text-dark)]">👤 Người dùng mới nhất</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}
                className="text-[var(--purple-deep)] font-semibold text-xs hover:bg-[var(--card-bg)] rounded-[8px]">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--card-bg)] transition-smooth cursor-pointer"
                  onClick={() => navigate("/admin/users")}>
                  <div className="w-9 h-9 rounded-full bg-gradient-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[var(--text-dark)] truncate">{u.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs rounded-full px-2 py-0.5 font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : u.status === "banned" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {u.status === "active" ? "Hoạt động" : u.status === "banned" ? "Bị cấm" : "Tạm ngưng"}
                    </Badge>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{u.joinDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[var(--text-dark)]">📋 Nhật ký gần đây</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/audit-logs")}
                className="text-[var(--purple-deep)] font-semibold text-xs hover:bg-[var(--card-bg)] rounded-[8px]">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--card-bg)] transition-smooth">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${log.status === "success" ? "bg-green-500" : log.status === "error" ? "bg-red-500" : "bg-yellow-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-dark)] truncate">{log.action}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{log.user} · {log.timestamp.slice(11, 16)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}