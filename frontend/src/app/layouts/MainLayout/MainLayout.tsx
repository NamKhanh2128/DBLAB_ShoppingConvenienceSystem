import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Home,
  ShoppingCart,
  Package,
  Utensils,
  ChefHat,
  FileText,
  Users,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
  UserCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useToastContext } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: Home },
  { name: "Mua sắm", href: "/app/shopping-list", icon: ShoppingCart, badge: 5 },
  { name: "Kho hàng", href: "/app/inventory", icon: Package },
  { name: "Bữa ăn", href: "/app/meal-plan", icon: Utensils },
  { name: "Công thức", href: "/app/recipes", icon: ChefHat },
  { name: "Báo cáo", href: "/app/reports", icon: FileText },
  { name: "Gia đình", href: "/app/family", icon: Users },
  { name: "Cài đặt", href: "/app/settings", icon: Settings },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToastContext();
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  const isActive = (href: string) =>
    location.pathname === href ||
    (href === "/app/dashboard" && location.pathname === "/app");

  const handleLogout = () => {
    logout();
    success("Đã đăng xuất", "Hẹn gặp lại bạn!");
    navigate("/auth/login");
  };

  const displayName = user?.HoTen || user?.hoTen || "Người dùng";
  const displayEmail = user?.Email || user?.email || "";
  const avatarLetters = displayName.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase();

  const SIDEBAR_W = sidebarExpanded ? "var(--sidebar-width-expanded)" : "var(--sidebar-width)";

  return (
    <div className="min-h-screen bg-[var(--background)]" style={{ display: "flex" }}>

      {/* ===== SIDEBAR ===== */}
      <aside
        style={{
          width: SIDEBAR_W,
          minWidth: SIDEBAR_W,
          transition: `width var(--transition-slow) var(--ease-smooth)`,
          background: "var(--white)", borderRight: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sidebar)",
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          zIndex: 50,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ---- Logo header ---- */}
        <div
          style={{
            padding: "20px 12px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarExpanded ? "space-between" : "center",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            flexShrink: 0,
          }}
        >
          <Link
            to="/app/dashboard"
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}
          >
            {/* Logo icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, #F9E79F, #F9E79F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(249,231,159,0.45)",
                flexShrink: 0,
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "#2C2C2C" }} strokeWidth={2.5} />
            </div>

            {/* Brand name — slides in when expanded */}
            <div
              style={{
                overflow: "hidden",
                maxWidth: sidebarExpanded ? 160 : 0,
                opacity: sidebarExpanded ? 1 : 0,
                transition: `max-width var(--transition-slow) var(--ease-smooth), opacity var(--transition-base) var(--ease-smooth)`,
                whiteSpace: "nowrap",
              }}
            >
              <p style={{ fontWeight: 900, color: "#FFFFFF", fontSize: 15, lineHeight: 1.2 }}>NATEAT</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Quản lý gia đình</p>
            </div>
          </Link>

          {/* Collapse button */}
          {sidebarExpanded && (
            <button
              onClick={() => setSidebarExpanded(false)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "none",
                background: "rgba(255,255,255,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background var(--transition-base)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        {/* ---- Expand button when collapsed ---- */}
        {!sidebarExpanded && (
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
            <button
              onClick={() => setSidebarExpanded(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "none",
                background: "rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background var(--transition-base)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--purple-pale)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            >
              <Menu className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        )}

        {/* ---- Navigation ---- */}
        <nav
          className="custom-scrollbar"
          style={{
            flex: 1,
            padding: "8px 10px",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                title={!sidebarExpanded ? item.name : undefined}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 44,
                  padding: sidebarExpanded ? "0 12px" : "0",
                  justifyContent: sidebarExpanded ? "flex-start" : "center",
                  borderRadius: 12,
                  textDecoration: "none",
                  background: active ? "var(--purple-pale)" : "transparent",
                  backdropFilter: active ? "blur(4px)" : "none",
                  transition: "background var(--transition-base) var(--ease-smooth)",
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "var(--section-alt)";
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {/* Active indicator */}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 26,
                      background: "linear-gradient(180deg,#F9E79F,#F9E79F)",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}

                {/* Icon container */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Icon
                    className="w-[19px] h-[19px]"
                    style={{ color: active ? "var(--purple-primary)" : "var(--text-muted)" }}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {/* Badge */}
                  {item.badge && (
                    <div
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        width: 16,
                        height: 16,
                        background: "#EF4444",
                        borderRadius: "50%",
                        border: "2px solid #A569BD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 8, fontWeight: 700, color: "var(--text-dark)" }}>{item.badge}</span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    overflow: "hidden",
                    maxWidth: sidebarExpanded ? 140 : 0,
                    opacity: sidebarExpanded ? 1 : 0,
                    transition: `max-width var(--transition-slow) var(--ease-smooth), opacity var(--transition-base) var(--ease-smooth)`,
                    whiteSpace: "nowrap",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--purple-primary)" : "var(--text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.name}
                </span>

                {/* Tooltip khi collapsed */}
                {!sidebarExpanded && (
                  <div
                    style={{
                      position: "absolute",
                      left: "calc(100% + 12px)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "#2C2C2C",
                      color: "var(--text-dark)",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 8,
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      opacity: 0,
                      transition: "opacity 0.15s",
                      zIndex: 100,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                    }}
                    className="sidebar-tooltip"
                  >
                    {item.name}
                    {item.badge && (
                      <span style={{ marginLeft: 6, background: "#EF4444", borderRadius: 99, padding: "1px 6px", fontSize: 10 }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ---- User Profile ---- */}
        <div
          style={{
            padding: "12px 10px 16px",
            borderTop: "1px solid rgba(0,0,0,0.04)",
            flexShrink: 0,
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: sidebarExpanded ? "8px 10px" : "8px",
                  justifyContent: sidebarExpanded ? "flex-start" : "center",
                  borderRadius: 12,
                  border: "none",
                  background: "rgba(255,255,255,0.07)",
                  cursor: "pointer",
                  transition: "background var(--transition-base)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--purple-pale)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar
                  className="flex-shrink-0"
                  style={{
                    width: 34,
                    height: 34,
                    border: "2px solid rgba(249,231,159,0.6)",
                    borderRadius: "50%",
                  }}
                >
                  <AvatarImage src="" />
                  <AvatarFallback
                    style={{
                      background: "linear-gradient(135deg, #F9E79F, #F9E79F)",
                      color: "#2C2C2C",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {avatarLetters}
                  </AvatarFallback>
                </Avatar>

                <div
                  style={{
                    overflow: "hidden",
                    maxWidth: sidebarExpanded ? 140 : 0,
                    opacity: sidebarExpanded ? 1 : 0,
                    transition: `max-width var(--transition-slow) var(--ease-smooth), opacity var(--transition-base) var(--ease-smooth)`,
                    textAlign: "left",
                  }}
                >
                  <p style={{ color: "var(--text-dark)", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{displayName}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 11, whiteSpace: "nowrap" }}>{displayEmail}</p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="right" align="end" className="w-56 ml-3">
              <DropdownMenuLabel>
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-xs text-[var(--text-muted)] font-normal">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app/family")}>
                <Users className="w-4 h-4 mr-2 text-[var(--purple-primary)]" />
                Gia đình Nguyễn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                <Settings className="w-4 h-4 mr-2 text-[var(--purple-primary)]" />
                Cài đặt tài khoản
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[var(--danger)]" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div
        style={{
          marginLeft: SIDEBAR_W,
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: `margin-left var(--transition-slow) var(--ease-smooth)`,
        }}
      >
        {/* Top Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            height: 64,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border-purple)",
            boxShadow: "0 2px 12px rgba(165,105,189,0.06)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 16,
          }}
        >
          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: 480 }}>
            <div style={{ position: "relative" }}>
              <Search
                className="w-4 h-4"
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="search"
                placeholder="Tìm kiếm thực phẩm, công thức..."
                style={{
                  width: "100%",
                  paddingLeft: 40,
                  paddingRight: 16,
                  paddingTop: 10,
                  paddingBottom: 10,
                  background: "var(--card-bg)",
                  border: "1.5px solid transparent",
                  borderRadius: 12,
                  fontSize: 13,
                  color: "var(--text-dark)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--purple-medium)";
                  e.target.style.boxShadow = "var(--shadow-input-focus)";
                  e.target.style.background = "#FFFFFF";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "transparent";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "var(--card-bg)";
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    position: "relative",
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    border: "none",
                    background: "var(--card-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--purple-pale)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--card-bg)")}
                >
                  <Bell className="w-5 h-5" style={{ color: "var(--purple-primary)" }} />
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 7,
                      height: 7,
                      background: "#EF4444",
                      borderRadius: "50%",
                      border: "2px solid #fff",
                    }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Thông báo</span>
                  <span className="text-xs font-normal text-[var(--text-muted)]">3 mới</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto scrollbar-light">
                  {[
                    { emoji: "🥬", title: "Rau sắp hết hạn", desc: "Cải xanh sẽ hết hạn trong 2 ngày", time: "10 phút trước" },
                    { emoji: "🛒", title: "Danh sách mới", desc: "Mẹ đã thêm 5 món vào danh sách", time: "1 giờ trước" },
                    { emoji: "📊", title: "Báo cáo tuần", desc: "Chi tiêu tuần này: 2,350,000đ", time: "2 giờ trước" },
                  ].map((n, i) => (
                    <DropdownMenuItem key={i} className="flex-col items-start gap-1 py-3">
                      <p className="text-sm font-semibold">{n.emoji} {n.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{n.desc}</p>
                      <span className="text-xs text-[var(--text-muted)]">{n.time}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 12px 6px 6px",
                    borderRadius: 12,
                    border: "1.5px solid var(--border-purple)",
                    background: "var(--card-bg)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--purple-primary)";
                    (e.currentTarget as HTMLElement).style.background = "var(--purple-pale)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-purple)";
                    (e.currentTarget as HTMLElement).style.background = "var(--card-bg)";
                  }}
                >
                  <Avatar style={{ width: 30, height: 30 }}>
                    <AvatarImage src="" />
                    <AvatarFallback
                      style={{
                        background: "linear-gradient(135deg,var(--purple-primary),var(--purple-medium))",
                        color: "var(--text-dark)",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      NA
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)", lineHeight: 1.3 }}>{displayName}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1 }}>{displayEmail}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{displayName}</p>
                    <p className="text-xs text-[var(--text-muted)] font-normal">{displayEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/family")}>
                  <Users className="w-4 h-4 mr-2 text-[var(--purple-primary)]" />
                  Gia đình Nguyễn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                  <UserCircle className="w-4 h-4 mr-2 text-[var(--purple-primary)]" />
                  Cài đặt tài khoản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[var(--danger)]" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: 24,
            background: "var(--background)",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Tooltip hover style */}
      <style>{`
        a:hover .sidebar-tooltip { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
