import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useToastContext } from "../../context/ToastContext";
import { QuickActionModal, AddMealPlanModal, ViewInventoryDetailsModal } from "../../components/common";
import { useDashboardStats, useMealPlan, useInventory } from "../../hooks/useData";
import { useAuth } from "../../context/AuthContext";


const chartColors = [
  'var(--success)',
  'var(--danger)',
  'var(--food-orange)',
  'var(--purple-deep)',
  'var(--gold)',
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, info, error } = useToastContext();
  const { stats, loading: statsLoading, reload: reloadStats } = useDashboardStats();
  const { todayMeals, addMeal, loadToday } = useMealPlan();
  const { expiring, reload: reloadInventory } = useInventory();

  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);

  const expenseData = useMemo(() => (
    stats.expenseTrend.map((item: any) => ({
      name: item.label || item.Ngay || item.name,
      value: Number(item.value ?? item.TongChiPhi ?? 0),
    }))
  ), [stats.expenseTrend]);

  const categoryData = useMemo(() => (
    stats.categorySpend.map((item: any, index: number) => ({
      name: item.name || item.DanhMuc || item.category || 'Khác',
      value: Number(item.value ?? item.TongChiPhi ?? 0),
      color: chartColors[index % chartColors.length],
    }))
  ), [stats.categorySpend]);

  const summaryCards = [
    {
      title: "Chi tiêu tháng này",
      value: stats.totalSpend > 0 ? `${stats.totalSpend.toLocaleString()}₫` : "--",
      change: "",
      trend: "up",
      icon: TrendingUp,
      gradient: "from-[var(--gold)] to-[var(--gold-light)]",
      route: "/app/reports",
      description: "Xem báo cáo chi tiết",
    },
    {
      title: "Thực phẩm trong kho",
      value: statsLoading ? "..." : String(stats.inventoryCount),
      subtitle: "món",
      change: `${stats.expiringCount} sắp hết hạn`,
      trend: stats.expiringCount > 0 ? "down" : "up",
      icon: Package,
      gradient: "from-[var(--purple-deep)] to-[var(--purple-light)]",
      route: "/app/inventory",
      description: `${stats.expiringCount} món sắp hết hạn`,
    },
    {
      title: "Danh sách mua sắm",
      value: statsLoading ? "..." : String(stats.shoppingListCount),
      subtitle: "món",
      change: `${stats.shoppingDoneCount} hoàn thành`,
      trend: "neutral",
      icon: ShoppingCart,
      gradient: "from-[var(--success)] to-[#10B981]",
      route: "/app/shopping-list",
      description: `${stats.shoppingDoneCount}/${stats.shoppingListCount} đã mua`,
    },
    {
      title: "Bữa ăn hôm nay",
      value: statsLoading ? "..." : String(todayMeals.length),
      subtitle: "bữa",
      change: "",
      trend: "neutral",
      icon: Sparkles,
      gradient: "from-[var(--food-orange)] to-[#FB923C]",
      route: "/app/meal-plan",
      description: "Xem kế hoạch bữa ăn",
    },
  ];

  const expiryAlerts = expiring.map((item: any) => ({
    id: item.MaTP,
    name: item.TenTP,
    daysLeft: item.HanSuDung ? Math.ceil((new Date(item.HanSuDung).getTime() - Date.now()) / 86400000) : 0,
    category: item.ViTri || 'Kho',
    priority: 'high',
    emoji: '🍱',
    quantity: item.SoLuong,
    unit: item.DonVi || '',
    location: item.ViTri || '',
  }));

  const mealCards = todayMeals.map((meal: any) => ({
    id: meal.MaKeHoach ?? meal.id,
    dish: meal.TenMon || meal.dish || 'Món ăn',
    time: meal.Buoi || meal.time || 'Hôm nay',
    emoji: '🍽️',
    status: meal.TrangThai || meal.status || 'ready',
  }));


  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return "buổi sáng";
    if (h < 18) return "buổi chiều";
    return "buổi tối";
  };

  const handleQuickAction = (action: string) => {
    setShowQuickAction(false);
    if (action === "shopping" || action === "add-shopping") navigate("/app/shopping-list");
    else if (action === "meal" || action === "add-meal") navigate("/app/meal-plan");
    else if (action === "inventory" || action === "add-inventory") navigate("/app/inventory");
    else if (action === "report" || action === "view-reports") navigate("/app/reports");
    else if (action === "add-recipe") navigate("/app/recipes");
    else if (action === "invite-member") navigate("/app/family");
  };

  const handleAddMeal = async (data: any) => {
    try {
      await addMeal({
        ngay: new Date().toISOString().split('T')[0],
        buoi: data.mealType === 'Sáng' ? 'SANG' : data.mealType === 'Trưa' ? 'TRUA' : 'TOI',
        maMon: 1,
        tenMon: data.recipeName || "Món mới",
      });
      await Promise.all([loadToday(), reloadStats(), reloadInventory()]);
      success("Thêm bữa ăn thành công!", `Đã thêm "${data.recipeName}" vào kế hoạch hôm nay.`);
    } catch (e: any) {
      error("Lỗi thêm bữa ăn", e.message);
    }
  };

  const handleViewAllExpiry = () => {
    navigate("/app/inventory");
    info("Chuyển sang Kho", "Xem tất cả thực phẩm sắp hết hạn.");
  };

  const handleStatCardClick = (route: string, title: string) => {
    navigate(route);
    info(`Xem ${title}`, "Đang chuyển trang...");
  };

  const quickActions = [
    { label: 'Thêm vào danh sách', icon: ShoppingCart, color: 'var(--gold)', action: "shopping" },
    { label: 'Lên kế hoạch bữa ăn', icon: Calendar, color: 'var(--purple-deep)', action: "meal" },
    { label: 'Nhập kho mới', icon: Package, color: 'var(--success)', action: "inventory" },
    { label: 'Xem báo cáo', icon: TrendingUp, color: 'var(--food-orange)', action: "report" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">
            Dashboard
          </h1>
          <p className="text-[var(--text-muted)]">
            Chào {getHour()}, <span className="text-[var(--gold)] font-semibold">{user?.HoTen || user?.hoTen || 'thành viên'}</span>! Đây là tổng quan gia đình hôm nay.
          </p>
        </div>

        <Button
          onClick={() => setShowQuickAction(true)}
          className="
            bg-gradient-gold text-white font-semibold px-6 py-6
            rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)]
            hover-lift transition-smooth
            self-start md:self-auto
          "
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
          Thêm nhanh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="
                border-none shadow-[var(--shadow-card)] 
                rounded-[var(--radius)] overflow-hidden
                hover-lift transition-smooth
                bg-white cursor-pointer
              "
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleStatCardClick(card.route, card.title)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-[14px] flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  {card.trend === 'up' && (
                    <Badge className="bg-[var(--success-light)] text-[var(--success)] border-none hover:bg-[var(--success-light)] font-semibold">
                      <ArrowUpRight className="w-3 h-3 mr-1" strokeWidth={2.5} />
                      {card.change}
                    </Badge>
                  )}
                  {card.trend === 'down' && (
                    <Badge className="bg-[var(--card-bg)] text-[var(--text-muted)] border-none hover:bg-[var(--card-bg)] font-semibold">
                      <ArrowDownRight className="w-3 h-3 mr-1" strokeWidth={2.5} />
                      {card.change}
                    </Badge>
                  )}
                  {card.trend === 'neutral' && (
                    <Badge className="bg-[var(--card-bg)] text-[var(--text-muted)] border-none hover:bg-[var(--card-bg)] font-semibold">
                      {card.change}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className="text-3xl font-black text-[var(--text-dark)]">
                    {card.value}
                    {card.subtitle && (
                      <span className="text-sm text-[var(--text-muted)] ml-1 font-normal">
                        {card.subtitle}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expense Trend Chart */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-[var(--text-dark)]">
                  Chi tiêu tuần này
                </CardTitle>
                <CardDescription className="text-[var(--text-muted)] mt-1">
                  Theo dõi chi tiêu hàng ngày (nghìn đồng)
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[var(--gold)]">
                  {stats.totalSpend > 0 ? `${Math.round(stats.totalSpend / 1000).toLocaleString()}k` : '--'}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1 justify-end">
                  <ArrowUpRight size={12} strokeWidth={3} />
                  Dữ liệu thực từ báo cáo
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={expenseData.length > 0 ? expenseData : [{ name: 'N/A', value: 0 }]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-purple)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  style={{ fontSize: '12px', fontFamily: 'var(--font-body)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  style={{ fontSize: '12px', fontFamily: 'var(--font-body)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-card)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--gold)"
                  strokeWidth={3}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth">
          <CardHeader>
            <CardTitle className="text-xl font-black text-[var(--text-dark)]">
              Phân bổ chi tiêu
            </CardTitle>
            <CardDescription className="text-[var(--text-muted)] mt-1">
              Chi tiêu theo danh mục thực phẩm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData : [{ name: 'Chưa có dữ liệu', value: 1, color: 'var(--border-purple)' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(categoryData.length > 0 ? categoryData : [{ name: 'Chưa có dữ liệu', value: 1, color: 'var(--border-purple)' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-card)',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 flex flex-col justify-center">
                {(categoryData.length > 0 ? categoryData : [{ name: 'Chưa có dữ liệu', value: 0, color: 'var(--border-purple)' }]).map((category, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-dark)] truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {category.value > 0 ? `${category.value.toLocaleString()}₫` : '0₫'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Expiry Alerts */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[var(--danger-light)] rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[var(--danger)]" strokeWidth={2.5} />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-[var(--text-dark)]">
                    Sắp hết hạn
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Cần sử dụng sớm
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-[var(--danger)] text-white border-none hover:bg-[var(--danger)] font-bold">
                {expiryAlerts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiryAlerts.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)] hover:bg-white hover:shadow-md transition-smooth group cursor-pointer"
                onClick={() => setSelectedInventoryItem({
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  location: item.location,
                  expiry: `${item.daysLeft} ngày`,
                  expiryStatus: item.priority,
                })}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-dark)] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`
                      border-none font-bold shrink-0
                      ${item.priority === 'high' ? 'bg-[var(--danger-light)] text-[var(--danger)]' : ''}
                      ${item.priority === 'medium' ? 'bg-[var(--warning-light)] text-[var(--warning)]' : ''}
                      ${item.priority === 'low' ? 'bg-[var(--info-light)] text-[var(--info)]' : ''}
                    `}
                  >
                    {item.daysLeft}d
                  </Badge>
                  <Eye className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full border-dashed border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)] font-semibold transition-smooth"
              onClick={handleViewAllExpiry}
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[var(--gold-light)]/30 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[var(--food-orange)]" strokeWidth={2.5} />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-[var(--text-dark)]">
                    Bữa ăn hôm nay
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Kế hoạch đã lên
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mealCards.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)] hover:bg-white hover:shadow-md transition-smooth group cursor-pointer"
                onClick={() => {
                  info(`${meal.dish}`, `${meal.time} — Xem chi tiết trong Kế hoạch bữa ăn`);
                  setTimeout(() => navigate("/app/meal-plan"), 600);
                }}
              >
                <span className="text-2xl">{meal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-dark)] truncate">
                    {meal.dish}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Clock size={12} />
                    {meal.time}
                  </p>
                </div>
                {meal.status === 'done' && (
                  <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                )}
                {meal.status === 'ready' && (
                  <Badge className="bg-[var(--warning-light)] text-[var(--warning)] border-none hover:bg-[var(--warning-light)] font-semibold">
                    Sẵn sàng
                  </Badge>
                )}
                {meal.status === 'pending' && (
                  <div className="w-5 h-5 border-2 border-[var(--border-purple)] rounded-full" />
                )}
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full border-dashed border-[var(--purple-deep)] text-[var(--purple-deep)] hover:bg-[var(--purple-deep)] hover:text-white rounded-[var(--radius-sm)] font-semibold transition-smooth"
              onClick={() => setShowAddMeal(true)}
            >
              Thêm bữa ăn
              <Plus className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth bg-gradient-purple">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-white">
                  Thao tác nhanh
                </CardTitle>
                <CardDescription className="text-white/80 text-xs">
                  Tính năng thường dùng
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (action.action === "shopping") navigate("/app/shopping-list");
                    else if (action.action === "meal") navigate("/app/meal-plan");
                    else if (action.action === "inventory") navigate("/app/inventory");
                    else if (action.action === "report") navigate("/app/reports");
                  }}
                  className="
                    w-full flex items-center gap-3 p-3
                    bg-white/10 hover:bg-white/25
                    rounded-[var(--radius-sm)]
                    text-left transition-smooth
                    group glass-hover
                  "
                >
                  <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" style={{ color: action.color }} strokeWidth={2.5} />
                  </div>
                  <p className="font-semibold text-sm text-white flex-1">
                    {action.label}
                  </p>
                  <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-[var(--radius)] p-4 shadow-[var(--shadow-card)] hover-lift transition-smooth cursor-pointer"
          onClick={() => navigate("/app/recipes")}
        >
          <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wide">
            Công thức mới
          </p>
          <p className="text-2xl font-black text-[var(--text-dark)]">24</p>
          <Progress value={65} className="mt-2 h-1.5" />
        </div>
        <div
          className="bg-white rounded-[var(--radius)] p-4 shadow-[var(--shadow-card)] hover-lift transition-smooth cursor-pointer"
          onClick={() => navigate("/app/family")}
        >
          <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wide">
            Thành viên
          </p>
          <p className="text-2xl font-black text-[var(--text-dark)]">5</p>
          <Progress value={100} className="mt-2 h-1.5" />
        </div>
        <div className="bg-white rounded-[var(--radius)] p-4 shadow-[var(--shadow-card)] hover-lift transition-smooth">
          <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wide">
            Hoàn thành
          </p>
          <p className="text-2xl font-black text-[var(--text-dark)]">87%</p>
          <Progress value={87} className="mt-2 h-1.5" />
        </div>
        <div className="bg-white rounded-[var(--radius)] p-4 shadow-[var(--shadow-card)] hover-lift transition-smooth">
          <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wide">
            Streak
          </p>
          <p className="text-2xl font-black text-[var(--text-dark)]">12 🔥</p>
          <Progress value={40} className="mt-2 h-1.5" />
        </div>
      </div>

      {/* Modals */}
      <QuickActionModal
        isOpen={showQuickAction}
        onClose={() => setShowQuickAction(false)}
        onAction={handleQuickAction}
      />

      <AddMealPlanModal
        isOpen={showAddMeal}
        onClose={() => setShowAddMeal(false)}
        onSubmit={handleAddMeal}
      />

      {selectedInventoryItem && (
        <ViewInventoryDetailsModal
          isOpen={!!selectedInventoryItem}
          onClose={() => setSelectedInventoryItem(null)}
          item={selectedInventoryItem}
        />
      )}
    </div>
  );
}