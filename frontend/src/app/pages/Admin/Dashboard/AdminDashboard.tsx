import { useNavigate } from "react-router";
import { useState } from "react";
import { Users, Database, Activity, AlertCircle, TrendingUp, Clock, Shield, Ban, UserCheck, ArrowRight, Trash2, ShieldAlert, CheckCircle2, HardDrive, Cpu } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from "../../../components/common/PageHeader";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { toast } from "../../../components/common/Toast";
import Modal from "../../../components/common/Modal";

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
  const { users, auditLogs, dashStats, cleanupFakeUsers, reload } = useAdmin();
  const navigate = useNavigate();

  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // Lấy chỉ số thống kê từ API hoặc fallback local state
  const totalUsers = dashStats?.totalUsers ?? users.length;
  const totalGroups = dashStats?.totalGroups ?? 12;
  const activeUsers = dashStats?.activeUsers ?? users.filter(u => u.status === "active").length;
  const bannedUsers = dashStats?.bannedUsers ?? users.filter(u => u.status === "banned").length;
  const newUsersCount = dashStats?.newUsersLast24h ?? 0;
  
  const errorLogs = auditLogs.filter(l => l.status === "error").length;

  const stats = [
    { title: "Tổng người dùng", value: totalUsers.toLocaleString(), change: "+12%", trend: "up" as const, icon: Users, gradient: "from-[var(--purple-deep)] to-[var(--purple-light)]" },
    { title: "Đang hoạt động", value: activeUsers.toLocaleString(), change: `${totalUsers > 0 ? Math.round(activeUsers/totalUsers*100) : 100}%`, trend: "up" as const, icon: UserCheck, gradient: "from-green-500 to-green-400" },
    { title: "Bị cấm", value: bannedUsers.toLocaleString(), change: bannedUsers > 0 ? "Cần xem lại" : "Tốt", trend: bannedUsers > 0 ? "down" as const : "up" as const, icon: Ban, gradient: "from-red-500 to-red-600" },
    { title: "Lỗi hệ thống", value: errorLogs.toLocaleString(), change: errorLogs === 0 ? "Bình thường" : "Có lỗi", trend: errorLogs > 0 ? "down" as const : "up" as const, icon: AlertCircle, gradient: "from-orange-500 to-orange-400" },
  ];

  const recentUsers = [...users].sort((a, b) => b.joinDate.localeCompare(a.joinDate)).slice(0, 5);
  const recentLogs = auditLogs.slice(0, 5);

  // Xử lý dọn dẹp hàng loạt tài khoản ảo
  const handleCleanup = async () => {
    setCleaning(true);
    try {
      const cleaned = await cleanupFakeUsers();
      toast.success(`Đã dọn dẹp thành công ${cleaned} tài khoản ảo đăng ký giả mạo!`);
      setCleanupOpen(false);
      await reload();
    } catch (e) {
      toast.error("Không thể dọn dẹp hệ thống.");
    } finally {
      setCleaning(false);
    }
  };

  // Ngưỡng phát hiện bất thường: > 50 tài khoản trong 24h qua (trong môi trường thực tế là >500)
  const isSpamDetected = newUsersCount > 50;

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Admin Dashboard" description="Tổng quan và quản lý hệ thống" icon={Shield} />

      {/* CẢNH BÁO ĐĂNG KÝ BẤT THƯỜNG (Spam Alarm Banner) */}
      {isSpamDetected && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 text-red-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-red-900 text-lg">CẢNH BÁO ĐĂNG KÝ BẤT THƯỜNG!</h3>
              <p className="text-red-700 text-sm mt-0.5">
                Phát hiện <strong>{newUsersCount}</strong> tài khoản mới đăng ký trong 24 giờ qua. Đây có thể là hành vi spam đăng ký hàng loạt từ robot hoặc script giả mạo.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setCleanupOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md hover-lift flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Dọn dẹp tài khoản ảo
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} change={s.change} trend={s.trend} icon={s.icon} gradient={s.gradient} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
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

      {/* BẢNG GIÁM SÁT SỨC KHỎE HỆ THỐNG (System Error & Health Monitor) */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Activity className="w-5 h-5 text-[var(--purple-deep)] animate-pulse" />
            <h3 className="text-lg font-black text-[var(--text-dark)]">🖥️ Bảng Giám Sát Sức Khỏe Hệ Thống</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Uptime hệ thống", value: "99.98%", sub: "Xuất sắc", color: "text-green-600", icon: CheckCircle2 },
              { label: "Tỷ lệ lỗi API 500", value: `${errorLogs > 0 ? "0.04%" : "0.01%"}`, sub: "Mức độ: An toàn", color: "text-green-600", icon: Activity },
              { label: "Tiêu thụ CPU", value: "24%", sub: "Ổn định", color: "text-blue-600", icon: Cpu },
              { label: "Tiêu thụ RAM", value: "48%", sub: "4.8GB / 10GB", color: "text-blue-600", icon: HardDrive },
              { label: "Độ trễ Database", value: "8ms", sub: "MSSQL Connection", color: "text-green-600", icon: Database },
              { label: "Hàng đợi Email", value: "0", sub: "Hoàn tất 100%", color: "text-slate-600", icon: Clock },
            ].map((item, index) => (
              <div key={index} className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] flex flex-col justify-between space-y-1">
                <p className="text-xs font-bold text-[var(--text-muted)]">{item.label}</p>
                <p className={`text-xl font-extrabold ${item.color} flex items-center gap-1.5 pt-1.5`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.value}
                </p>
                <p className="text-[10px] font-semibold text-gray-400 pt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-black text-[var(--text-dark)]">👤 Người dùng mới nhất</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}
                className="text-[var(--purple-deep)] font-semibold text-xs hover:bg-[var(--card-bg)] rounded-[8px]">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-center py-6 text-xs text-gray-400">Không có người dùng mới</p>
              ) : recentUsers.map(u => (
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-black text-[var(--text-dark)]">📋 Nhật ký gần đây</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/audit-logs")}
                className="text-[var(--purple-deep)] font-semibold text-xs hover:bg-[var(--card-bg)] rounded-[8px]">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <p className="text-center py-6 text-xs text-gray-400">Không có nhật ký hoạt động</p>
              ) : recentLogs.map(log => (
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

      {/* Modal dọn dẹp hệ thống */}
      <Modal
        isOpen={cleanupOpen}
        onClose={() => setCleanupOpen(false)}
        title="Dọn dẹp tài khoản ảo đăng ký spam"
        size="sm"
      >
        <div className="space-y-4 p-1">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Đồng ý quét và dọn dẹp?</p>
              <p className="text-xs text-red-700 mt-0.5">
                Hệ thống sẽ thực hiện dọn dẹp hàng loạt các tài khoản được đăng ký trong 24 giờ qua mà chưa gia nhập bất kỳ nhóm gia đình nào và không có hoạt động.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              disabled={cleaning}
              onClick={() => setCleanupOpen(false)}
              className="flex-1 rounded-lg"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCleanup}
              disabled={cleaning}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
            >
              {cleaning ? "Đang xử lý..." : "Quét & Dọn dẹp"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}