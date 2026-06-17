import { Link, useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToastContext } from "../../../context/ToastContext";
import { familyApi } from "../../../services/api";

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { success, error, info } = useToastContext();

  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inviteCode = new URLSearchParams(window.location.search).get('inviteCode');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen || !email || !password) {
      error("Vui lòng nhập đầy đủ thông tin", "Tất cả các trường đều bắt buộc");
      return;
    }
    if (password !== confirmPassword) {
      error("Mật khẩu không khớp", "Vui lòng kiểm tra lại mật khẩu xác nhận");
      return;
    }
    if (password.length < 5) {
      error("Mật khẩu quá ngắn", "Mật khẩu phải có ít nhất 5 ký tự");
      return;
    }
    try {
      await register(hoTen, email, password);
      
      if (inviteCode) {
        info("Đang tự động gia nhập...", "Đang kết nối tài khoản mới của bạn với nhóm gia đình...");
        try {
          await familyApi.joinFamily(inviteCode);
          success("🎉 Gia nhập gia đình thành công!", "Tài khoản của bạn đã được kết nối với gia đình.");
        } catch (joinErr: any) {
          error("Không thể tự động gia nhập gia đình", joinErr.message || "Mã mời đã hết hạn hoặc không tồn tại.");
        }
      } else {
        success("🎉 Đăng ký thành công!", "Tài khoản của bạn đã sẵn sàng để sử dụng.");
      }
      
      navigate("/app/dashboard");
    } catch (err: any) {
      error("Đăng ký thất bại", err.message || "Email đã được sử dụng");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 hover-lift">
          <div className="w-14 h-14 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-[var(--shadow-btn)]">
            <ShoppingCart className="w-7 h-7 text-[var(--text-dark)]" />
          </div>
        </Link>
        <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Tạo tài khoản
        </h1>
        <p className="text-gray-600">
          Bắt đầu quản lý mua sắm thông minh ngay hôm nay
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        {inviteCode && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
            💡 Bạn đang sử dụng liên kết mời gia đình. Hệ thống sẽ tự động liên kết tài khoản mới của bạn với nhóm ngay sau khi đăng ký!
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="fullname">Họ và tên</Label>
            <Input
              id="fullname"
              type="text"
              placeholder="Nguyễn Văn A"
              value={hoTen}
              onChange={e => setHoTen(e.target.value)}
              className="h-12 rounded-xl focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 rounded-xl focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12 rounded-xl focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="h-12 rounded-xl focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] transition-smooth"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-gold hover:shadow-lg text-[var(--text-dark)] rounded-xl text-base font-bold hover-lift transition-smooth"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang đăng ký...</>
            ) : "Đăng ký"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors font-bold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
