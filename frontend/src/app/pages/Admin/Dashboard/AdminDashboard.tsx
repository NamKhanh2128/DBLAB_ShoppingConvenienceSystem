import { useNavigate } from "react-router";
import { useState } from "react";
import {
  Users, Database, Activity, AlertCircle, Clock, Shield, Ban,
  UserCheck, ArrowRight, Trash2, ShieldAlert, CheckCircle2,
  BookOpen, ShoppingCart, Home
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { PageHeader } from "../../../components/common/PageHeader";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { toast } from "../../../components/common/Toast";
import Modal from "../../../components/common/Modal";

export function AdminDashboard() {
  const { users, auditLogs, dashStats, reportsStats, cleanupFakeUsers, reload } = useAdmin();
  const navigate = useNavigate();

  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // ── Stats từ API thực ──────────────────────────────────────────
  const totalUsers  = dashStats?.totalUsers  ?? users.length;
  const totalGroups = dashStats?.totalGroups ?? 0;
  const activeUsers = dashStats?.activeUsers ?? users.filter(u => u.status === "active").length;
  const bannedUsers = dashStats?.bannedUsers ?? users.filter(u => u.status === "locked").length;
  const newUsersCount = dashStats?.newUsersLast24h ?? 0;
  const totalRecipes = dashStats?.totalRecipes ?? 0;
  const totalLists   = dashStats?.totalLists   ?? 0;

  const errorLogs = auditLogs.filter(l => l.status === "error").length;

  const stats = [
    {
      title: "Tổng người dùng",
      value: totalUsers.toLocaleString(),
      change: `${newUsersCount} mới hôm nay`,
      trend: "up" as const,
      icon: Users,
      gradient: "from-[var(--purple-deep)] to-[var(--purple-light)]"
    },
    {
      title: "Đang hoạt động",
      value: activeUsers.toLocaleString(),
      change: `${totalUsers > 0 ? Math.round(activeUsers / totalUsers * 100) : 100}%`,
      trend: "up" as const,
      icon: UserCheck,
      gradient: "from-green-500 to-green-400"
    },
    {
      title: "Bị cấm",
      value: bannedUsers.toLocaleString(),
      change: bannedUsers > 0 ? "Cần xem lại" : "Tốt",
      trend: bannedUsers > 0 ? "down" as const : "up" as const,
      icon: Ban,
      gradient: "from-red-500 to-red-600"
    },
    {
      title: "Lỗi hệ thống",
      value: errorLogs.toLocaleString(),
      change: errorLogs === 0 ? "Bình thường" : "Có lỗi",
      trend: errorLogs > 0 ? "down" as const : "up" as const,
      icon: AlertCircle,
      gradient: "from-orange-500 to-orange-400"
    },
  ];

  const recentUsers = [...users]
    .sort((a, b) => b.joinDate.localeCompare(a.joinDate))
    .slice(0, 5);
  const recentLogs = auditLogs.slice(0, 5);

  // ── Biểu đồ từ reportsStats.trend (chi tiêu theo tháng — thực) ──
  const trendChartData = (reportsStats?.trend || []).map((item: any) => ({
    label: item.label || '',
    spend: Math.round(Number(item.spend || 0) / 1000), // đổi sang nghìn đồng cho dễ đọc
    waste: Math.round(Number(item.waste || 0) / 1000),
  }));

  // ── Biểu đồ hoạt động 7 ngày từ reportsStats.activity (thực) ──
  const activityChartData = (reportsStats?.activity || []).map((item: any) => ({
    day: item.day || '',
    mới: item.new || 0,
    hoàn_thành: item.active || 0,
  }));

  // ── Biểu đồ phân bổ danh mục chi tiêu từ reportsStats.categoryDistribution (thực) ──
  const categoryColors = ['var(--purple-deep)', 'var(--gold)', 'var(--success)', 'var(--food-orange)', '#EC4899', '#6366F1', '#14B8A6'];
  const categoryChartData = (reportsStats?.categoryDistribution || [])
    .filter((c: any) => Number(c.value || 0) > 0)
    .slice(0, 4)
    .map((item: any) => ({
      name: item.name || 'Khác',
      value: Number(item.value || 0),
    }));

  // ── Thống kê hệ thống thực từ dashStats ──────────────────────
  const systemMetrics = [
    {
      label: "Tổng nhóm gia đình",
      value: totalGroups.toLocaleString(),
      sub: "Đang hoạt động",
      color: "text-purple-600",
      icon: Home,
    },
    {
      label: "Công thức nấu ăn",
      value: totalRecipes.toLocaleString(),
      sub: "Toàn hệ thống",
      color: "text-emerald-600",
      icon: BookOpen,
    },
    {
      label: "Phiên đi chợ",
      value: totalLists.toLocaleString(),
      sub: "Đã tạo",
      color: "text-blue-600",
      icon: ShoppingCart,
    },
    {
      label: "Thành viên/Nhóm",
      value: totalGroups > 0 ? (totalUsers / totalGroups).toFixed(1) : "0",
      sub: "Trung bình",
      color: "text-indigo-600",
      icon: Users,
    },
    {
      label: "Tài khoản mới",
      value: newUsersCount.toLocaleString(),
      sub: "Trong 24h qua",
      color: newUsersCount > 50 ? "text-red-600" : "text-green-600",
      icon: Activity,
    },
    {
      label: "Nhật ký lỗi",
      value: errorLogs.toLocaleString(),
      sub: errorLogs === 0 ? "Hệ thống ổn định" : "Cần kiểm tra",
      color: errorLogs > 0 ? "text-red-600" : "text-green-600",
      icon: AlertCircle,
    },
  ];

  // ── Dọn dẹp tài khoản ảo ─────────────────────────────────────
  const handleCleanup = async () => {
    setCleaning(true);
    try {
      const cleaned = await cleanupFakeUsers();
      toast.success(`Đã dọn dẹp thành công ${cleaned} tài khoản ảo đăng ký giả mạo!`);
      setCleanupOpen(false);
      await reload();
    } catch {
      toast.error("Không thể dọn dẹp hệ thống.");
    } finally {
      setCleaning(false);
    }
  };

  const isSpamDetected = newUsersCount > 50;

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Admin Dashboard" description="Tổng quan và quản lý hệ thống" icon={Shield} />

      {/* CẢNH BÁO ĐĂNG KÝ BẤT THƯỜNG */}
      {isSpamDetected && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 text-red-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-red-900 text-lg">CẢNH BÁO ĐĂNG KÝ BẤT THƯỜNG!</h3>
              <p className="text-red-700 text-sm mt-0.5">
                Phát hiện <strong>{newUsersCount}</strong> tài khoản mới đăng ký trong 24 giờ qua. Đây có thể là hành vi spam.
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

      {/* Charts — dữ liệu thực */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Biểu đồ chi tiêu & lãng phí theo tháng (từ BaoCaoChiTieu) */}
        <Card className="lg:col-span-2 border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-black text-[var(--text-dark)]">Chi tiêu & Lãng phí theo tháng</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {trendChartData.length > 0 ? `${trendChartData.length} tháng gần nhất · Đơn vị: nghìn ₫` : 'Chưa có dữ liệu báo cáo'}
                </p>
              </div>
              {trendChartData.length > 0 && (
                <Badge className="bg-gradient-purple text-white rounded-full px-4 py-1.5 font-semibold shadow-md cursor-pointer" onClick={() => navigate('/admin/reports')}>
                  Xem chi tiết →
                </Badge>
              )}
            </div>
            {trendChartData.length === 0 ? (
              <div className="h-[260px] flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
                <Database className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">Chưa có dữ liệu báo cáo chi tiêu</p>
                <p className="text-xs opacity-70">Dữ liệu sẽ xuất hiện sau khi có phiên đi chợ hoàn thành</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="label" stroke="var(--text-muted)" style={{ fontSize: '12px', fontWeight: 600 }} />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px', fontWeight: 600 }} tickFormatter={(v) => `${v}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${Number(value).toLocaleString()}k ₫`,
                      name === 'spend' ? 'Chi tiêu' : name === 'waste' ? 'Lãng phí' : name
                    ]}
                    contentStyle={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="spend" stroke="var(--purple-deep)" strokeWidth={3} dot={{ fill: "var(--purple-deep)", r: 5 }} name="Chi tiêu" />
                  <Line type="monotone" dataKey="waste" stroke="#EF4444" strokeWidth={2.5} strokeDasharray="4 4" dot={{ fill: "#EF4444", r: 4 }} name="Lãng phí" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Biểu đồ phân bổ danh mục chi tiêu (từ ChiTietMuaSam) */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-[var(--text-dark)] mb-1">Phân bổ danh mục</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Chi tiêu thực tế theo quầy hàng</p>
            {categoryChartData.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
                <ShoppingCart className="w-8 h-8 opacity-30" />
                <p className="text-xs font-medium text-center">Chưa có mặt hàng nào<br />được ghi nhận danh mục</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                      {categoryChartData.map((_: any, i: number) => <Cell key={i} fill={categoryColors[i % categoryColors.length]} />)}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} ₫`, 'Chi tiêu']}
                      contentStyle={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {categoryChartData.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-dark)] truncate">{item.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{item.value.toLocaleString()}₫</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ hoạt động đi chợ 7 ngày */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-black text-[var(--text-dark)]">📊 Hoạt động Đi Chợ (7 Ngày Qua)</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Số phiên đi chợ tạo mới và hoàn thành mỗi ngày — dữ liệu thực</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reports')}
              className="text-[var(--purple-deep)] font-semibold text-xs hover:bg-[var(--card-bg)] rounded-[8px]">
              Xem báo cáo <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }} />
              <Bar dataKey="mới" name="Giỏ tạo mới" fill="var(--gold)" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="hoàn_thành" name="Đã hoàn thành" fill="var(--purple-deep)" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bảng thống kê hệ thống thực */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Activity className="w-5 h-5 text-[var(--purple-deep)]" />
            <h3 className="text-lg font-black text-[var(--text-dark)]">📈 Thống Kê Hệ Thống Thực Tế</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {systemMetrics.map((item, index) => (
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
                    <Badge className={`text-xs rounded-full px-2 py-0.5 font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : u.status === "locked" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {u.status === "active" ? "Hoạt động" : u.status === "locked" ? "Đã khóa" : "Tạm ngưng"}
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
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-[var(--text-muted)]">
                  <Clock className="w-8 h-8 opacity-30" />
                  <p className="text-xs font-medium">Không có nhật ký hoạt động</p>
                </div>
              ) : recentLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--card-bg)] transition-smooth">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${log.status === "success" ? "bg-green-500" : log.status === "error" ? "bg-red-500" : "bg-yellow-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-dark)] truncate">{log.action}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{log.user} · {log.timestamp.slice(11, 16)}</p>
                  </div>
                  <Badge className={`text-xs rounded-full px-2 py-0.5 font-semibold shrink-0 ${log.status === "success" ? "bg-green-100 text-green-700" : log.status === "error" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {log.status === "success" ? "OK" : log.status === "error" ? "Lỗi" : "Cảnh báo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Families */}
      {(reportsStats?.topFamilies || []).length > 0 && (
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-black text-[var(--text-dark)]">🏆 Top gia đình hoạt động tích cực</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Xếp hạng theo tổng chi tiêu đi chợ</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reports')}
                className="text-[var(--purple-deep)] font-semibold text-xs hover:bg-[var(--card-bg)] rounded-[8px]">
                Chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-muted)]">
                <thead className="text-xs text-[var(--text-dark)] uppercase bg-[var(--card-bg)] font-bold border-b border-[var(--border-light)]">
                  <tr>
                    <th className="px-4 py-3">Hạng</th>
                    <th className="px-4 py-3">Nhóm gia đình</th>
                    <th className="px-4 py-3 text-center">Thành viên</th>
                    <th className="px-4 py-3 text-center">Phiên hoàn thành</th>
                    <th className="px-4 py-3 text-right">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {(reportsStats.topFamilies || []).map((fam: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-black text-[var(--purple-deep)]">#{index + 1}</td>
                      <td className="px-4 py-3 font-bold text-[var(--text-dark)]">{fam.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 bg-purple-50 text-[var(--purple-deep)] font-semibold text-xs rounded-full border border-purple-100">
                          {fam.memberCount} tv
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{fam.completedLists}</td>
                      <td className="px-4 py-3 text-right font-black text-[var(--purple-deep)]">
                        {Number(fam.totalSpend || 0).toLocaleString()} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal dọn dẹp */}
      <Modal isOpen={cleanupOpen} onClose={() => setCleanupOpen(false)} title="Dọn dẹp tài khoản ảo đăng ký spam" size="sm">
        <div className="space-y-4 p-1">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Đồng ý quét và dọn dẹp?</p>
              <p className="text-xs text-red-700 mt-0.5">
                Hệ thống sẽ thực hiện xóa mềm các tài khoản đăng ký trong 24 giờ qua chưa gia nhập bất kỳ nhóm gia đình nào và không có hoạt động.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 pt-2">
            <Button variant="outline" disabled={cleaning} onClick={() => setCleanupOpen(false)} className="flex-1 rounded-lg">
              Hủy
            </Button>
            <Button onClick={handleCleanup} disabled={cleaning} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm">
              {cleaning ? "Đang xử lý..." : "Quét & Dọn dẹp"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}