import { Outlet, Navigate } from "react-router";
import { Sparkles, CheckCircle2, Calendar, Package, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const features = [
  {
    icon: Calendar,
    title: "Kế hoạch bữa ăn",
    description: "Lên thực đơn tuần, tự động tạo danh sách mua sắm",
    color: "from-[var(--gold)] to-[var(--gold-light)]",
  },
  {
    icon: Package,
    title: "Quản lý kho",
    description: "Theo dõi hạn sử dụng, giảm lãng phí thực phẩm",
    color: "from-[var(--purple-deep)] to-[var(--purple-light)]",
  },
  {
    icon: TrendingUp,
    title: "Báo cáo chi tiêu",
    description: "Phân tích chi tiêu, tối ưu ngân sách gia đình",
    color: "from-[var(--success)] to-[#10B981]",
  },
];

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-[var(--purple-pale)] border-t-[var(--purple-primary)] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[var(--purple-primary)]">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-purple p-12 items-center justify-center relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-[var(--gold)] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-md">
          {/* Logo & Title */}
          <div className="mb-12 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[20px] mb-6 shadow-[var(--shadow-btn)] hover-lift transition-smooth">
              <Sparkles className="w-10 h-10 text-[var(--gold)]" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-black mb-4 text-white leading-tight">
              Đi Chợ Tiện Lợi
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Quản lý mua sắm thông minh cho cả gia đình 🛒
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-[var(--radius-lg)] p-5 border border-white/20 glass-hover transition-smooth"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 text-white">
                    <h3 className="font-bold mb-1 text-base">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-white/10 backdrop-blur-sm rounded-[var(--radius-lg)] p-4 border border-white/20">
              <p className="text-3xl font-black text-white mb-1">10K+</p>
              <p className="text-xs text-white/80 font-medium">Gia đình</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-[var(--radius-lg)] p-4 border border-white/20">
              <p className="text-3xl font-black text-white mb-1">30%</p>
              <p className="text-xs text-white/80 font-medium">Tiết kiệm</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-[var(--radius-lg)] p-4 border border-white/20">
              <p className="text-3xl font-black text-white mb-1">5.0</p>
              <p className="text-xs text-white/80 font-medium">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
