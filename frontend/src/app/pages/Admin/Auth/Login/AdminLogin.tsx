import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "../../../../components/common/Toast";
import { useAdmin } from "../../../../context/AdminContext";

export function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAdmin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Gọi API thực — không còn setTimeout giả lập
      await loginAdmin(email, password);
      toast.success("Xác thực quản trị viên thành công!");
      navigate("/admin/dashboard");
    } catch (err: any) {
      // Phân biệt lỗi "không phải admin" với lỗi "sai mật khẩu"
      const msg: string = err.message || "Đăng nhập thất bại";
      if (msg.includes("không có quyền") || msg.includes("Admin Panel")) {
        toast.error("⛔ " + msg);
      } else if (msg.includes("bị khóa") || msg.includes("khóa")) {
        toast.error("🔒 Tài khoản này đã bị khóa. Liên hệ hỗ trợ kỹ thuật.");
      } else {
        toast.error("Đăng nhập thất bại: " + msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7B5EA7] via-[#6A4C9C] to-[#593D85] p-4 relative overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-[20px] mb-6 border border-white/20 shadow-2xl">
            <Shield className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-black text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Admin Panel
          </h1>
          <p className="text-white/80 font-medium text-lg">Chào mừng trở lại, Hệ quản trị cao cấp</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-[24px] p-8 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-white font-semibold">
                Email quản trị
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shoppingapp.com"
                autoComplete="email"
                className="h-12 rounded-[14px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50 focus-visible:border-white/50 transition-smooth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-white font-semibold">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 rounded-[14px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50 focus-visible:border-white/50 transition-smooth pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-[var(--purple-deep)] hover:bg-gray-100 rounded-[14px] text-base font-bold shadow-lg shadow-black/10 hover-lift mt-4 transition-smooth"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </Button>
          </form>

          {/* Security notice */}
          <div className="mt-5 p-3 bg-white/5 rounded-[12px] border border-white/10">
            <p className="text-white/50 text-xs text-center">
              🔐 Chỉ tài khoản có vai trò <strong className="text-white/70">ADMIN</strong> mới được truy cập hệ thống quản trị này.
            </p>
          </div>
        </div>

        <p className="text-center text-white/70 font-medium text-sm mt-8">
          <Link to="/" className="hover:text-white hover:underline transition-colors">
            &larr; Trở về trang người dùng
          </Link>
        </p>
      </div>
    </div>
  );
}
