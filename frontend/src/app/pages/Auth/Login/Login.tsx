import { Link, useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToastContext } from "../../../context/ToastContext";

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { success, error } = useToastContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Vui lòng nhập đầy đủ thông tin", "Email và mật khẩu không được để trống");
      return;
    }
    try {
      await login(email, password);
      success("🎉 Đăng nhập thành công!", "Chào mừng bạn trở lại!");
      navigate("/app/dashboard");
    } catch (err: any) {
      error("Đăng nhập thất bại", err.message || "Sai email hoặc mật khẩu");
    }
  };

  return (
    <div className="w-full animate-slide-up">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center justify-center mb-6 hover-lift transition-smooth">
          <div className="w-14 h-14 bg-gradient-purple rounded-[16px] flex items-center justify-center shadow-[var(--shadow-btn)]">
            <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </Link>
        <h1 className="text-4xl font-black text-[var(--text-dark)] mb-2">
          Chào mừng trở lại! 👋
        </h1>
        <p className="text-[var(--text-muted)] text-lg">
          Đăng nhập để tiếp tục quản lý mua sắm thông minh
        </p>
      </div>

      <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--border-light)]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--text-dark)] font-semibold">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 pl-12 pr-4 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] focus-visible:shadow-[var(--shadow-input-focus)] transition-smooth"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[var(--text-dark)] font-semibold">
                Mật khẩu
              </Label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-[var(--gold)] hover:text-[var(--gold-hover)] font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 pl-12 pr-12 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] focus-visible:shadow-[var(--shadow-input-focus)] transition-smooth"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-[var(--border-medium)]" />
            <label htmlFor="remember" className="text-sm font-medium text-[var(--text-dark)] leading-none cursor-pointer">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-gold text-white rounded-[var(--radius-btn)] text-base font-bold shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang đăng nhập...</>
            ) : "Đăng nhập"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="text-[var(--gold)] hover:text-[var(--gold-hover)] font-bold transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
