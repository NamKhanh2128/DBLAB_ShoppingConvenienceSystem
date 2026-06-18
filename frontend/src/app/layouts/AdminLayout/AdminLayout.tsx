import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router";
import { toast } from "../../components/common/Toast";
import { AdminProvider, useAdmin } from "../../context/AdminContext";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Database,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'Dữ liệu gốc', href: '/admin/master-data', icon: Database },
  { name: 'Nhật ký hệ thống', href: '/admin/audit-logs', icon: FileText },
  { name: 'Báo cáo', href: '/admin/reports', icon: BarChart3 },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
];

// Inner component that has access to AdminContext via useAdmin()
function AdminLayoutInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, isAdminAuthenticated, logoutAdmin } = useAdmin();

  // Dynamic page title and favicon for Admin Panel
  useEffect(() => {
    document.title = "Admin Panel - Quản trị hệ thống";
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>";
  }, [location.pathname]);

  // Login page renders without sidebar
  if (location.pathname === '/admin/login') {
    if (isAdminAuthenticated) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Outlet />;
  }

  // Route guard — unauthenticated users cannot access any admin page
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await logoutAdmin();
    toast.success("Đã đăng xuất thành công!");
    navigate("/admin/login");
  };

  const adminName = adminUser!.name;
  const adminEmail = adminUser!.email;
  const adminInitials = adminName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-[var(--card-bg)]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white text-[var(--text-dark)] transition-all duration-300 z-50 border-r border-[var(--border-light)] shadow-[0_4px_24px_rgba(123,94,167,0.08)] ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-light)]">
            {!sidebarCollapsed && (
              <Link to="/admin/dashboard" className="flex items-center gap-3 hover-lift-sm transition-smooth">
                <div className="w-11 h-11 bg-gradient-purple rounded-[14px] flex items-center justify-center shadow-[var(--shadow-btn)]">
                  <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="font-black text-lg text-[var(--text-dark)] block leading-tight">
                    Admin Panel
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    Quản trị viên
                  </span>
                </div>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-[var(--text-dark)] hover:bg-[var(--card-bg)] hover:text-[var(--purple-deep)] rounded-[10px] transition-smooth"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-smooth group ${
                    active
                      ? 'bg-gradient-purple text-white shadow-[var(--shadow-btn)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--purple-deep)] hover-lift-sm'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${active ? '' : 'group-hover:scale-110 transition-transform'}`}
                    strokeWidth={2.5}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-semibold">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Profile */}
          <div className="p-4 border-t border-[var(--border-light)]">
            {sidebarCollapsed ? (
              <Avatar className="w-10 h-10 cursor-pointer mx-auto hover-lift-sm transition-smooth">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-gold text-white font-bold">{adminInitials}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--card-bg)] transition-smooth">
                <Avatar className="w-11 h-11 border-2 border-[var(--gold)]">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-gold text-white font-bold">{adminInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-dark)] truncate">{adminName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{adminEmail}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--text-muted)] hover:bg-white hover:text-red-600 rounded-[8px] transition-smooth"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[var(--border-light)] sticky top-0 z-40 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm người dùng, nhóm, dữ liệu..."
                  className="pl-10 h-10 bg-[var(--card-bg)] border-[var(--border-light)] text-[var(--text-dark)] placeholder:text-[var(--text-muted)] focus-visible:ring-[var(--purple-deep)] focus-visible:border-[var(--purple-deep)] rounded-[var(--radius-sm)]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[var(--text-dark)] hover:bg-[var(--card-bg)] hover:text-[var(--purple-deep)] rounded-[10px] transition-smooth"
              >
                <Bell className="w-5 h-5" strokeWidth={2.5} />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-br from-red-500 to-red-600 text-xs border-2 border-white shadow-md">
                  5
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 text-[var(--text-dark)] hover:bg-[var(--card-bg)] rounded-[var(--radius-sm)] px-3 h-10 hover-lift-sm transition-smooth"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-purple text-white font-bold text-xs">{adminInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline font-semibold">{adminName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-[var(--radius-sm)] shadow-[var(--shadow-card)] border-[var(--border-light)]"
                >
                  <DropdownMenuLabel className="font-bold text-[var(--text-dark)]">{adminName}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[var(--border-light)]" />
                  <DropdownMenuItem className="cursor-pointer rounded-[8px] font-medium focus:bg-[var(--card-bg)] focus:text-[var(--purple-deep)]">
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-[8px] font-medium focus:bg-[var(--card-bg)] focus:text-[var(--purple-deep)]">
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[var(--border-light)]" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-[8px] font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" strokeWidth={2.5} />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-[var(--purple-pale)] border-t-[var(--purple-primary)] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[var(--purple-primary)]">Đang tải cấu hình quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminProvider>
      <AdminLayoutInner />
    </AdminProvider>
  );
}
