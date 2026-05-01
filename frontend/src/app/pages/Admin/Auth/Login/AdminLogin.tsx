import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "../../../../components/common/Toast";

export function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    
    // Giả lập thời gian kết nối API
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Xác thực quản trị viên thành công!");
      navigate("/admin/dashboard");
    }, 1500);
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
          <h1 className="text-4xl font-black text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Admin Panel
          </h1>
          <p className="text-white/80 font-medium text-lg">Chào mừng trở lại, Hệ quản trị cao cấp</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-[24px] p-8 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-white font-semibold">Email quản trị</Label>
              <Input 
                id="admin-email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hfc.com" 
                className="h-12 rounded-[14px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50 focus-visible:border-white/50 transition-smooth" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label htmlFor="admin-password" className="text-white font-semibold">Mật khẩu</Label>
                 <span className="text-sm font-medium text-white/70 cursor-pointer hover:text-white transition-colors">
                    Trợ giúp?
                 </span>
              </div>
              <Input 
                id="admin-password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="h-12 rounded-[14px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50 focus-visible:border-white/50 transition-smooth" 
              />
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
        </div>

        <p className="text-center text-white/70 font-medium text-sm mt-8">
          <Link to="/" className="hover:text-white hover:underline transition-colors">&larr; Trở về trang người dùng</Link>
        </p>
      </div>
    </div>
  );
}
