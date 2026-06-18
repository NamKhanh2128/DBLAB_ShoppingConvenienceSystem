import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import {
  ShoppingCart,
  CalendarDays,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  BarChart3,
  Sparkles,
  Package,
  ChefHat,
  Shield,
  Zap,
  Heart,
  Clock,
  Leaf,
  ChevronRight,
  Play,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

/* ─── Data ─────────────────────────────────────── */
const features = [
  {
    icon: CalendarDays,
    title: "Kế hoạch bữa ăn",
    description: "Lên thực đơn tuần, tự động tạo danh sách mua sắm thông minh cho cả gia đình",
    color: "#A569BD",
    colorLight: "#EDE9FE",
    tag: "Phổ biến nhất",
  },
  {
    icon: ShoppingCart,
    title: "Danh sách mua sắm",
    description: "Phân công nhiệm vụ, chia sẻ và theo dõi tiến độ mua sắm theo thời gian thực",
    color: "#F9E79F",
    colorLight: "#FEF3C7",
    tag: null,
  },
  {
    icon: Package,
    title: "Quản lý kho",
    description: "Theo dõi hạn sử dụng, cảnh báo sắp hết hàng, giảm thiểu lãng phí thực phẩm",
    color: "#10B981",
    colorLight: "#D1FAE5",
    tag: null,
  },
  {
    icon: BarChart3,
    title: "Báo cáo chi tiêu",
    description: "Phân tích chi tiêu chi tiết, tối ưu ngân sách gia đình một cách thông minh",
    color: "#3B82F6",
    colorLight: "#DBEAFE",
    tag: null,
  },
];

const benefits = [
  { icon: Clock, text: "Giảm 70% thời gian lập kế hoạch mua sắm" },
  { icon: TrendingUp, text: "Tiết kiệm tối đa 30% chi phí thực phẩm hàng tháng" },
  { icon: Leaf, text: "Giảm 80% lượng thực phẩm bị hỏng và lãng phí" },
  { icon: Shield, text: "Dữ liệu được bảo mật và mã hoá an toàn tuyệt đối" },
  { icon: Users, text: "Cả gia đình cùng tham gia, mọi lứa tuổi đều dùng được" },
  { icon: Heart, text: "Bữa ăn lành mạnh, cân bằng dinh dưỡng hơn mỗi ngày" },
];

const testimonials = [
  {
    name: "Chị Nguyễn Mai",
    role: "Mẹ của 2 con",
    content: "Ứng dụng giúp tôi tiết kiệm được 30% chi phí mua sắm hàng tháng. Không còn mua thừa thực phẩm nữa!",
    rating: 5,
    avatar: "NM",
    color: "#A569BD",
  },
  {
    name: "Anh Trần Minh",
    role: "Trưởng nhóm gia đình",
    content: "Rất tiện lợi khi cả gia đình cùng quản lý danh sách mua sắm. Không còn quên mua gì nữa.",
    rating: 5,
    avatar: "TM",
    color: "#F9E79F",
  },
  {
    name: "Chị Lê Hương",
    role: "Người nội trợ",
    content: "Chức năng lên kế hoạch bữa ăn và theo dõi hạn sử dụng thực phẩm rất hữu ích cho gia đình!",
    rating: 5,
    avatar: "LH",
    color: "#10B981",
  },
];

const steps = [
  { step: "01", title: "Tạo tài khoản", desc: "Đăng ký miễn phí trong 30 giây, không cần thẻ tín dụng" },
  { step: "02", title: "Mời gia đình", desc: "Thêm các thành viên gia đình, phân quyền linh hoạt" },
  { step: "03", title: "Lên kế hoạch", desc: "Tạo thực đơn tuần, hệ thống tự sinh danh sách mua sắm" },
  { step: "04", title: "Theo dõi & Báo cáo", desc: "Xem chi tiêu, phân tích và tối ưu ngân sách gia đình" },
];

/* ─── Component ─────────────────────────────────── */
export function Homepage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "var(--font-body)" }}>

      {/* ═══════════════════════════════════════
          NAV BAR
      ══════════════════════════════════════════ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(252,252,252,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(165,105,189,0.10)",
          boxShadow: "0 2px 16px rgba(165,105,189,0.06)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#8E44AD,#A569BD)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(165,105,189,0.35)" }}>
              <Sparkles className="w-5 h-5" style={{ color: "#F9E79F" }} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 18, color: "#2C2C2C", letterSpacing: "-0.3px" }}>
                Đi Chợ <span style={{ color: "#A569BD" }}>Tiện Lợi</span>
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {["Tính năng", "Lợi ích", "Đánh giá"].map((label) => (
              <a key={label} href={`#${label}`} style={{ padding: "8px 14px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none", transition: "all 0.18s" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = "#A569BD"; (e.target as HTMLElement).style.background = "#F4ECF7"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = "#374151"; (e.target as HTMLElement).style.background = "transparent"; }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/auth/login">
              <Button variant="ghost" style={{ fontWeight: 600, color: "#8E44AD", borderRadius: 10 }}>
                Đăng nhập
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button
                style={{
                  background: "linear-gradient(135deg,#8E44AD,#A569BD)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: "0 20px",
                  boxShadow: "0 4px 16px rgba(165,105,189,0.35)",
                  border: "none",
                }}
              >
                Bắt đầu miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #3B0764 0%, #A569BD 35%, #8E44AD 70%, #A569BD 100%)",
          padding: "80px 24px 100px",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(139,92,246,0.25)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(249,231,159,0.18)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(40px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

            {/* Left copy */}
            <div className="animate-slide-up">
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(249,231,159,0.18)", border: "1px solid rgba(249,231,159,0.40)", borderRadius: 99, padding: "7px 16px", marginBottom: 24 }}>
                <Sparkles className="w-4 h-4" style={{ color: "#F9E79F" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#FEF3C7" }}>Giải pháp đi chợ & quản lý tủ lạnh tối ưu</span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 52,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  lineHeight: 1.15,
                  marginBottom: 20,
                  letterSpacing: "-1px",
                }}
              >
                Đi chợ thông minh
                <br />
                <span style={{ background: "linear-gradient(135deg,#F9E79F,#F9E79F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  cho cả gia đình 🛒
                </span>
              </h1>

              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.80)", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                Quản lý mua sắm, kế hoạch bữa ăn và kho thực phẩm trong một ứng dụng.
                Tiết kiệm thời gian, tiền bạc và giảm lãng phí thực phẩm hiệu quả.
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
                <Link to="/auth/register">
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 28px",
                      background: "linear-gradient(135deg,#F9E79F,#F9E79F)",
                      color: "#2C2C2C",
                      fontWeight: 800,
                      fontSize: 15,
                      border: "none",
                      borderRadius: 12,
                      cursor: "pointer",
                      boxShadow: "0 6px 24px rgba(249,231,159,0.45)",
                      transition: "all 0.2s",
                      fontFamily: "var(--font-body)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(249,231,159,0.55)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(249,231,159,0.45)"; }}
                  >
                    Bắt đầu miễn phí
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </Link>

                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 22px",
                    background: "rgba(255,255,255,0.12)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: 15,
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    borderRadius: 12,
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.20)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Xem demo
                </button>
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                {[
                  { icon: CheckCircle2, text: "Miễn phí mãi mãi" },
                  { icon: CheckCircle2, text: "Không cần thẻ tín dụng" },
                  { icon: CheckCircle2, text: "Cài đặt trong 30 giây" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon className="w-4 h-4" style={{ color: "#86EFAC" }} strokeWidth={2.5} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right image */}
            <div className="animate-slide-up" style={{ animationDelay: "0.15s", position: "relative" }}>
              <div
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.40)",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=900"
                  alt="Family Shopping"
                  className="w-full h-auto"
                />
              </div>

              {/* Floating card — saving */}
              <div
                className="animate-float"
                style={{
                  position: "absolute",
                  bottom: -20,
                  left: -24,
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "14px 18px",
                  boxShadow: "0 12px 40px rgba(165,105,189,0.22)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#10B981,#34D399)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(16,185,129,0.35)" }}>
                  <Clock className="w-5 h-5" style={{ color: "#fff" }} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 900, color: "#2C2C2C", lineHeight: 1.2 }}>Lên lịch ăn</p>
                  <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Nhanh chóng & dễ dàng</p>
                </div>
              </div>

              {/* Floating card — families */}
              <div
                className="animate-float"
                style={{
                  position: "absolute",
                  top: -20,
                  right: -24,
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "14px 18px",
                  boxShadow: "0 12px 40px rgba(165,105,189,0.22)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animationDelay: "1.5s",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#F9E79F,#F9E79F)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249,231,159,0.35)" }}>
                  <Users className="w-5 h-5" style={{ color: "#2C2C2C" }} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 900, color: "#2C2C2C", lineHeight: 1.2 }}>Đồng bộ</p>
                  <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Thành viên gia đình</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section style={{ padding: "48px 24px", background: "#FFFFFF", borderBottom: "1px solid #EDE9FE" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
          {[
            { value: "Tự động", label: "Lập danh sách", sub: "từ thực đơn tuần", icon: ShoppingCart },
            { value: "Trực quan", label: "Quản lý tủ lạnh", sub: "phát hiện hạn dùng", icon: Package },
            { value: "Dinh dưỡng", label: "Gợi ý bữa ăn", sub: "công thức chi tiết", icon: ChefHat },
            { value: "Kết nối", label: "Đồng bộ gia đình", sub: "mọi lúc mọi nơi", icon: Users },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="animate-slide-up"
                style={{
                  textAlign: "center",
                  padding: "24px 16px",
                  borderRight: i < 3 ? "1px solid #EDE9FE" : "none",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#8E44AD,#A569BD)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 14px rgba(165,105,189,0.30)" }}>
                  <Icon className="w-5 h-5" style={{ color: "#F9E79F" }} strokeWidth={2.5} />
                </div>
                <p
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    fontFamily: "var(--font-heading)",
                    background: "linear-gradient(135deg,#A569BD,#A569BD)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#2C2C2C", marginBottom: 2 }}>{stat.label}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF" }}>{stat.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="Tính năng" style={{ padding: "80px 24px", background: "#F8F7FF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EDE9FE", borderRadius: 99, padding: "6px 16px", marginBottom: 16 }}>
              <Sparkles className="w-4 h-4" style={{ color: "#A569BD" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8E44AD" }}>Tính năng nổi bật</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 38, fontWeight: 900, color: "#2C2C2C", marginBottom: 12 }}>
              Mọi thứ bạn cần ✨
            </h2>
            <p style={{ fontSize: 17, color: "#6B7280", maxWidth: 520, margin: "0 auto" }}>
              Giải pháp toàn diện để quản lý mua sắm và bữa ăn gia đình thông minh
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="animate-slide-up"
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 20,
                    padding: 24,
                    border: "1.5px solid #EDE9FE",
                    boxShadow: "0 4px 20px rgba(165,105,189,0.07)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    animationDelay: `${i * 0.08}s`,
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-5px)";
                    el.style.boxShadow = "0 16px 40px rgba(165,105,189,0.15)";
                    el.style.borderColor = f.color;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "";
                    el.style.boxShadow = "0 4px 20px rgba(165,105,189,0.07)";
                    el.style.borderColor = "#EDE9FE";
                  }}
                >
                  {f.tag && (
                    <div style={{ position: "absolute", top: 14, right: 14, background: "linear-gradient(135deg,#F9E79F,#F9E79F)", borderRadius: 99, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#2C2C2C" }}>
                      {f.tag}
                    </div>
                  )}

                  <div style={{ width: 56, height: 56, borderRadius: 16, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, boxShadow: `0 6px 18px ${f.color}40` }}>
                    <Icon className="w-7 h-7" style={{ color: "#FFFFFF" }} strokeWidth={2.5} />
                  </div>

                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 800, color: "#2C2C2C", marginBottom: 8 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.65 }}>{f.description}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 18, color: f.color, fontSize: 13, fontWeight: 700 }}>
                    Tìm hiểu thêm
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEF3C7", borderRadius: 99, padding: "6px 16px", marginBottom: 16 }}>
              <Zap className="w-4 h-4" style={{ color: "#F7DC6F" }} fill="#F7DC6F" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>Cách thức hoạt động</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 38, fontWeight: 900, color: "#2C2C2C", marginBottom: 12 }}>
              Bắt đầu chỉ trong 4 bước 🚀
            </h2>
            <p style={{ fontSize: 17, color: "#6B7280" }}>Đơn giản, nhanh chóng và hiệu quả ngay từ ngày đầu tiên</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, position: "relative" }}>
            {/* Connector line */}
            <div style={{ position: "absolute", top: 36, left: "12.5%", right: "12.5%", height: 2, background: "linear-gradient(90deg,#A569BD,#A78BFA,#C4B5FD,#EDE9FE)", zIndex: 0, borderRadius: 2 }} />

            {steps.map((s, i) => (
              <div key={i} className="animate-slide-up" style={{ textAlign: "center", position: "relative", zIndex: 1, animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#A569BD,#A569BD)" : "#FFFFFF", border: "3px solid", borderColor: i === 0 ? "transparent" : "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: i === 0 ? "0 8px 24px rgba(165,105,189,0.40)" : "0 4px 16px rgba(165,105,189,0.10)" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: i === 0 ? "#F9E79F" : "#A569BD" }}>{s.step}</span>
                </div>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 800, color: "#2C2C2C", marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BENEFITS
      ══════════════════════════════════════════ */}
      <section id="Lợi ích" style={{ padding: "80px 24px", background: "#F8F7FF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

          {/* Image */}
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 16px 48px rgba(165,105,189,0.18)", border: "2px solid #EDE9FE" }}>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=900"
                alt="Fresh market vegetables"
                className="w-full h-auto hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Overlay badge */}
            <div style={{ position: "absolute", bottom: 20, right: -16, background: "linear-gradient(135deg,#A569BD,#A569BD)", borderRadius: 16, padding: "14px 20px", boxShadow: "0 8px 28px rgba(165,105,189,0.40)", color: "#fff" }}>
              <p style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.2 }}>Thông minh</p>
              <p style={{ fontSize: 12, opacity: 0.80 }}>Tránh lãng phí</p>
            </div>
          </div>

          {/* Benefits list */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EDE9FE", borderRadius: 99, padding: "6px 16px", marginBottom: 20 }}>
              <Heart className="w-4 h-4" style={{ color: "#A569BD" }} fill="#A569BD" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8E44AD" }}>Lợi ích vượt trội</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 900, color: "#2C2C2C", marginBottom: 12, lineHeight: 1.25 }}>
              Tại sao chọn<br />
              <span style={{ color: "#A569BD" }}>Đi Chợ Tiện Lợi?</span>
            </h2>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 32, lineHeight: 1.7 }}>
              Thiết kế hiện đại, trực quan giúp cả gia đình dễ dàng sử dụng. Từ người cao tuổi đến trẻ em đều tham gia được.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={i}
                    className="animate-slide-up"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1.5px solid #EDE9FE",
                      transition: "all 0.2s",
                      animationDelay: `${i * 0.06}s`,
                      cursor: "default",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#A78BFA"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(165,105,189,0.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#EDE9FE"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#8E44AD,#A569BD)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 10px rgba(165,105,189,0.30)" }}>
                      <Icon className="w-4 h-4" style={{ color: "#F9E79F" }} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{b.text}</span>
                  </div>
                );
              })}
            </div>

            <Link to="/auth/register">
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 28,
                  padding: "13px 26px",
                  background: "linear-gradient(135deg,#A569BD,#A569BD)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(165,105,189,0.35)",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                Thử ngay miễn phí
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section id="Đánh giá" style={{ padding: "80px 24px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEF3C7", borderRadius: 99, padding: "6px 16px", marginBottom: 16 }}>
              <Star className="w-4 h-4" style={{ color: "#F9E79F" }} fill="#F9E79F" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>Đánh giá người dùng</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 38, fontWeight: 900, color: "#2C2C2C", marginBottom: 12 }}>
              Người dùng nói gì 💬
            </h2>
            <p style={{ fontSize: 17, color: "#6B7280" }}>Hàng ngàn gia đình đã tin dùng và yêu thích</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{
                  background: "#FFFFFF",
                  borderRadius: 20,
                  padding: 26,
                  border: "1.5px solid #EDE9FE",
                  boxShadow: "0 4px 20px rgba(165,105,189,0.07)",
                  position: "relative",
                  transition: "all 0.25s",
                  animationDelay: `${i * 0.1}s`,
                  cursor: "default",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 14px 36px rgba(165,105,189,0.14)"; el.style.borderColor = "#C4B5FD"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "0 4px 20px rgba(165,105,189,0.07)"; el.style.borderColor = "#EDE9FE"; }}
              >
                {/* Quote mark */}
                <div style={{ fontSize: 64, fontFamily: "Georgia, serif", color: "#EDE9FE", lineHeight: 0.7, marginBottom: 10 }}>"</div>

                {/* Stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4" style={{ color: "#F9E79F" }} fill="#F9E79F" />
                  ))}
                </div>

                <p style={{ fontSize: 14.5, color: "#374151", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                  "{t.content}"
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${t.color}50` }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{t.avatar}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#2C2C2C" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(135deg, #3B0764 0%, #A569BD 40%, #8E44AD 80%, #A569BD 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(249,231,159,0.12)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(249,231,159,0.20)", border: "1px solid rgba(249,231,159,0.35)", borderRadius: 99, padding: "8px 20px", marginBottom: 24 }}>
            <Sparkles className="w-4 h-4" style={{ color: "#F9E79F" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#FEF3C7" }}>Sẵn sàng thay đổi cách mua sắm?</span>
          </div>

          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.2, marginBottom: 16 }}>
            Bắt đầu quản lý <br />
            <span style={{ background: "linear-gradient(135deg,#F9E79F,#F9E79F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              thông minh hơn ngay hôm nay
            </span>
          </h2>

          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", marginBottom: 36, lineHeight: 1.7 }}>
            Tham gia cùng hàng ngàn gia đình đang sử dụng Đi Chợ Tiện Lợi — hoàn toàn miễn phí!
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link to="/auth/register">
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "15px 32px",
                  background: "linear-gradient(135deg,#F9E79F,#F9E79F)",
                  color: "#2C2C2C",
                  fontWeight: 800,
                  fontSize: 16,
                  border: "none",
                  borderRadius: 13,
                  cursor: "pointer",
                  boxShadow: "0 8px 28px rgba(249,231,159,0.50)",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(249,231,159,0.60)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(249,231,159,0.50)"; }}
              >
                Đăng ký miễn phí ngay
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </Link>

            <Link to="/auth/login">
              <button
                style={{
                  padding: "15px 26px",
                  background: "rgba(255,255,255,0.12)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 15,
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  borderRadius: 13,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
              >
                Đã có tài khoản? Đăng nhập
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: "#2C2C2C", color: "#FFFFFF", padding: "56px 24px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#F9E79F,#F9E79F)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles className="w-5 h-5" style={{ color: "#2C2C2C" }} strokeWidth={2.5} />
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 16 }}>Đi Chợ Tiện Lợi</span>
              </div>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 260 }}>
                Quản lý mua sắm thông minh cho gia đình Việt. Tiết kiệm thời gian, tiền bạc và yêu thương hơn mỗi ngày.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                {["Facebook", "Zalo", "YouTube"].map((s) => (
                  <button key={s} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.04)", color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(165,105,189,0.40)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: "Sản phẩm", links: ["Tính năng", "Bảng giá", "Tải ứng dụng", "Cập nhật mới"] },
              { title: "Công ty", links: ["Về chúng tôi", "Blog", "Tuyển dụng", "Liên hệ"] },
              { title: "Pháp lý", links: ["Điều khoản", "Bảo mật", "Cookies", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#F9E79F", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>{col.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.18s" }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.color = "#C4B5FD"; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.40)" }}>© 2026 Đi Chợ Tiện Lợi. Made with ❤️ in Vietnam</p>
            <div style={{ display: "flex", gap: 6 }}>
              {["VI", "EN"].map((lang, i) => (
                <button key={lang} style={{ padding: "5px 12px", borderRadius: 7, background: i === 0 ? "rgba(165,105,189,0.50)" : "rgba(0,0,0,0.04)", color: i === 0 ? "#C4B5FD" : "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.18s" }}>{lang}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}