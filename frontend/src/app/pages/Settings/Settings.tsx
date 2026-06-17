import { useState, useEffect } from "react";
import { Bell, Lock, User, Globe, Camera, Shield, ChevronRight, Eye, EyeOff, Check, Loader2, Users, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { useToastContext } from "../../context/ToastContext";
import { Modal, ConfirmDialog } from "../../components/common";
import { useAuth } from "../../context/AuthContext";
import { usersApi, familyApi, authApi } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

export function Settings() {
  const { success, error, info, warning } = useToastContext();
  const { user, setUser, groupId } = useAuth();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    const fetchInviteCode = async () => {
      if (!groupId) return;
      setLoadingCode(true);
      try {
        const res = await familyApi.getInvites(groupId);
        const activeInvite = res.data?.find((i: any) => !i.IsDeleted && new Date(i.ExpiresAt) > new Date());
        if (activeInvite) {
          setInviteCode(activeInvite.Code);
        } else {
          // If no active code, generate one
          const genRes = await familyApi.generateInvite(groupId, 100);
          setInviteCode(genRes.data?.code || genRes.data?.MaCode || null);
        }
      } catch (e) {
        console.warn("Không thể tải mã mời:", e);
      } finally {
        setLoadingCode(false);
      }
    };
    fetchInviteCode();
  }, [groupId]);

  // Profile state — khởi tạo từ auth context (dữ liệu thật)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync từ user context khi mount
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.HoTen || user.hoTen || "",
        email: user.Email || user.email || "",
        phone: user.SoDienThoai || user.soDienThoai || "",
        bio: user.Bio || user.bio || "",
      });
    }
  }, [user]);

  // Notification state
  const [notifications, setNotifications] = useState({
    expiryAlert: true,
    shoppingReminder: true,
    mealReminder: false,
    familyActivity: true,
    weeklyReport: false,
  });

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Language — connected to global LanguageContext
  const { language, setLanguage } = useLanguage();

  // Password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [saving2FA, setSaving2FA] = useState(false);
  const is2FAEnabled = !!(user?.IsTwoFactorEnabled);

  // ─── HANDLER: Lưu hồ sơ → gọi API thật ───
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!profile.name.trim()) {
      error("Lỗi lưu thông tin", "Vui lòng nhập họ tên đầy đủ.");
      return;
    }
    if (!profile.email.includes("@")) {
      error("Email không hợp lệ", "Vui lòng nhập địa chỉ email đúng định dạng.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await usersApi.updateProfile({
        hoTen: profile.name,
        email: profile.email,
        soDienThoai: profile.phone,
        bio: profile.bio,
      });
      // Cập nhật lại context để header cũng thay đổi
      if (setUser && res.data) setUser(res.data);
      success("✅ Lưu thông tin thành công!", "Hồ sơ của bạn đã được cập nhật.");
    } catch (e: any) {
      error("Lỗi cập nhật", e.message || "Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── HANDLER: Đổi mật khẩu → gọi API thật ───
  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!passwords.current) {
      error("Vui lòng nhập mật khẩu hiện tại", "Mật khẩu hiện tại không được để trống.");
      return;
    }
    if (passwords.new.length < 5) {
      error("Mật khẩu quá ngắn", "Mật khẩu mới phải có ít nhất 5 ký tự.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      error("Mật khẩu không khớp", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setSavingPassword(true);
    try {
      await usersApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      success("✅ Đổi mật khẩu thành công!", "Mật khẩu của bạn đã được cập nhật.");
      setPasswords({ current: "", new: "", confirm: "" });
      setShowChangePassword(false);
    } catch (e: any) {
      error("Đổi mật khẩu thất bại", e.message || "Mật khẩu hiện tại không đúng hoặc lỗi hệ thống.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ─── HANDLER: Toggle notification (local + saved to localStorage) ───
  const handleToggleNotification = (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    const updated = { ...notifications, [key]: newValue };
    setNotifications(updated);
    localStorage.setItem("user_notifications", JSON.stringify(updated));
    const label: Record<string, string> = {
      expiryAlert: "Cảnh báo sắp hết hạn",
      shoppingReminder: "Nhắc mua sắm",
      mealReminder: "Nhắc bữa ăn",
      familyActivity: "Hoạt động gia đình",
      weeklyReport: "Báo cáo tuần",
    };
    if (newValue) success(`🔔 Bật thông báo`, `"${label[key]}" đã được bật.`);
    else info(`🔕 Tắt thông báo`, `"${label[key]}" đã được tắt.`);
  };

  const handleSaveLanguage = () => {
    // Already saved reactively via setLanguage, but call again to ensure persistence
    setLanguage(language as 'vi' | 'en');
    success("🌐 Đã lưu ngôn ngữ!", `Ngôn ngữ hiển thị: ${language === 'vi' ? 'Tiếng Việt' : 'English'}.`);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await usersApi.deleteAccount();
      success("🗑️ Đã xóa tài khoản", "Tài khoản của bạn đã được xóa vĩnh viễn.");
      localStorage.removeItem("token");
      localStorage.removeItem("groupId");
      window.location.href = "/auth/login";
    } catch (e: any) {
      error("Lỗi xóa tài khoản", e.message || "Không thể xóa tài khoản.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // ─── HANDLER: Cấu hình 2FA ───
  const handleOpen2FA = async () => {
    if (is2FAEnabled) {
      // Tắt 2FA không cần OTP
      setSaving2FA(true);
      try {
        await authApi.disable2FA();
        if (setUser && user) setUser({ ...user, IsTwoFactorEnabled: 0 });
        success("🔓 Đã tắt 2FA", "Xác thực 2 bước đã được vô hiệu hóa.");
      } catch (e: any) {
        error("Lỗi", e.message || "Không thể tắt 2FA.");
      } finally {
        setSaving2FA(false);
      }
      return;
    }
    // Gọi setup để lấy secret
    setSaving2FA(true);
    try {
      const res = await authApi.setup2FA();
      setTwoFactorData(res.data);
      setTwoFactorCode("");
      setShow2FAModal(true);
    } catch (e: any) {
      error("Lỗi", e.message || "Không thể khởi tạo 2FA.");
    } finally {
      setSaving2FA(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length < 6) {
      error("Lỗi", "Vui lòng nhập mã OTP 6 chữ số từ ứng dụng xác thực.");
      return;
    }
    setSaving2FA(true);
    try {
      await authApi.enable2FA(twoFactorCode);
      if (setUser && user) setUser({ ...user, IsTwoFactorEnabled: 1 });
      success("🔐 Bật 2FA thành công!", "Tài khoản của bạn đã được bảo vệ bởi xác thực 2 bước.");
      setShow2FAModal(false);
      setTwoFactorData(null);
      setTwoFactorCode("");
    } catch (e: any) {
      error("Mã OTP không đúng", e.message || "Vui lòng kiểm tra lại mã trong ứng dụng xác thực.");
    } finally {
      setSaving2FA(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      error("Lỗi", "Kích thước ảnh đại diện phải nhỏ hơn 5MB");
      return;
    }
    
    try {
      info("📷 Tải ảnh", "Đang tải ảnh đại diện lên...");
      const res = await usersApi.uploadAvatar(file);
      if (res.success) {
        if (setUser && res.data) setUser(res.data);
        success("✅ Thành công!", "Ảnh đại diện đã được cập nhật.");
      }
    } catch (err: any) {
      error("Lỗi tải ảnh đại diện", err.message || "Không thể tải ảnh.");
    }
  };

  const displayName = profile.name || "Người dùng";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl animate-slide-up">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">Cài đặt</h1>
        <p className="text-[var(--text-muted)]">Quản lý cài đặt tài khoản và ứng dụng ⚙️</p>
      </div>

      {/* Profile Card */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <div className="w-8 h-8 bg-gradient-purple rounded-[10px] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>Cập nhật hồ sơ tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-[var(--gold)]/20 shadow-lg">
                <AvatarImage src={user?.Avatar || user?.avatar || ""} />
                <AvatarFallback className="bg-gradient-gold text-white text-2xl font-black">
                  {avatarLetter}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--purple-deep)] rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                onClick={() => document.getElementById("avatar-upload")?.click()}
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-bold text-[var(--text-dark)]">{displayName}</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">{profile.email}</p>
              <Badge className="mt-2 bg-[var(--gold)]/10 text-[var(--gold)] border-none font-semibold">
                {user?.VaiTro === 'ADMIN' ? '👑 Quản trị viên' : '👤 Thành viên'}
              </Badge>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">Họ và tên</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                  disabled={savingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                  disabled={savingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                  disabled={savingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="font-semibold">Giới thiệu</Label>
                <Input
                  id="bio"
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                  disabled={savingProfile}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="bg-gradient-gold text-white rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift font-semibold px-8"
              disabled={savingProfile}
            >
              {savingProfile ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Lưu thay đổi</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Family Section */}
      {groupId && (
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <div className="w-8 h-8 bg-gradient-gold rounded-[10px] flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              Nhóm gia đình & Mã liên kết
            </CardTitle>
            <CardDescription>Mã mời các thành viên tham gia gia đình của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Mã liên kết gia đình</p>
                {loadingCode ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] font-medium py-1">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
                    Đang tải mã mời...
                  </div>
                ) : inviteCode ? (
                  <code className="text-2xl font-black text-[var(--gold)] tracking-widest block py-1">{inviteCode}</code>
                ) : (
                  <p className="text-sm text-[var(--danger)] font-semibold">Chưa có mã liên kết. Vui lòng bấm tạo mới.</p>
                )}
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  * Thành viên khác nhập mã 8 ký tự này tại trang <strong>Thiết lập gia đình</strong> để chia sẻ tủ lạnh.
                </p>
              </div>
              {inviteCode && (
                <Button
                  variant="outline"
                  className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)] font-bold shrink-0 self-start md:self-auto"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    success("📋 Đã sao chép mã mời vào clipboard!", inviteCode);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Sao chép mã
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--food-orange)] to-[#EA580C] rounded-[10px] flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            Thông báo
          </CardTitle>
          <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "expiryAlert" as const, label: "Cảnh báo sắp hết hạn", desc: "Nhận thông báo khi thực phẩm gần hết hạn" },
            { key: "shoppingReminder" as const, label: "Nhắc mua sắm", desc: "Nhắc khi có món trong danh sách mua" },
            { key: "mealReminder" as const, label: "Nhắc bữa ăn", desc: "Nhắc chuẩn bị bữa ăn theo kế hoạch" },
            { key: "familyActivity" as const, label: "Hoạt động gia đình", desc: "Thông báo khi thành viên cập nhật" },
            { key: "weeklyReport" as const, label: "Báo cáo tuần", desc: "Tóm tắt chi tiêu và hoạt động tuần" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] hover:bg-[var(--card-bg)] transition-smooth">
              <div>
                <Label className="font-semibold cursor-pointer">{item.label}</Label>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</p>
              </div>
              <Switch checked={notifications[item.key]} onCheckedChange={() => handleToggleNotification(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--purple-deep)] to-[var(--purple-light)] rounded-[10px] flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            Bảo mật
          </CardTitle>
          <CardDescription>Quản lý mật khẩu và bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            className="w-full flex items-center justify-between p-4 rounded-[var(--radius-sm)] border border-[var(--border-light)] hover:border-[var(--purple-deep)] hover:bg-[var(--card-bg)] transition-smooth group"
            onClick={() => setShowChangePassword(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--card-bg)] rounded-lg flex items-center justify-center group-hover:bg-[var(--purple-deep)]/10 transition-smooth">
                <Lock className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--purple-deep)]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--text-dark)]">Đổi mật khẩu</p>
                <p className="text-xs text-[var(--text-muted)]">Cập nhật mật khẩu đăng nhập</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--purple-deep)] group-hover:translate-x-1 transition-all" />
          </button>

          <button
            className="w-full flex items-center justify-between p-4 rounded-[var(--radius-sm)] border border-[var(--border-light)] hover:border-[var(--info)] hover:bg-[var(--card-bg)] transition-smooth group disabled:opacity-50"
            onClick={handleOpen2FA}
            disabled={saving2FA}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--card-bg)] rounded-lg flex items-center justify-center group-hover:bg-[var(--info)]/10 transition-smooth">
                <Shield className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--info)]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--text-dark)]">Xác thực 2 bước</p>
                <p className="text-xs text-[var(--text-muted)]">{is2FAEnabled ? "Đang bật — nhấn để tắt" : "Tăng cường bảo mật tài khoản"}</p>
              </div>
            </div>
            {is2FAEnabled
              ? <Badge className="bg-[var(--success-light)] text-[var(--success)] border-none font-semibold">Đang bật</Badge>
              : <Badge className="bg-[var(--card-bg)] text-[var(--text-muted)] border-none font-semibold">Tắt</Badge>
            }
          </button>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--info)] to-[#2563EB] rounded-[10px] flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            Ngôn ngữ & Hiển thị
          </CardTitle>
          <CardDescription>Tuỳ chỉnh ngôn ngữ và giao diện</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-semibold mb-3 block">Ngôn ngữ</Label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: "vi", label: "🇻🇳 Tiếng Việt" }, { value: "en", label: "🇺🇸 English" }].map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value as 'vi' | 'en')}
                  className={`p-3 rounded-[var(--radius-sm)] border-2 font-semibold text-sm transition-smooth ${language === lang.value
                    ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-[var(--gold)]'
                    : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--gold)]/50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="bg-gradient-gold text-white rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift font-semibold"
            onClick={handleSaveLanguage}
          >
            <Check className="w-4 h-4 mr-2" />Lưu cài đặt
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] border border-[var(--danger-light)]">
        <CardHeader>
          <CardTitle className="text-[var(--danger)] flex items-center gap-2">⚠️ Vùng nguy hiểm</CardTitle>
          <CardDescription>Các hành động không thể hoàn tác</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white rounded-[var(--radius-btn)] font-semibold transition-smooth"
            onClick={handleDeleteAccount}
          >
            Xóa tài khoản
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => { setShowChangePassword(false); setPasswords({ current: "", new: "", confirm: "" }); }}
        title="Đổi mật khẩu"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowChangePassword(false)} className="rounded-[var(--radius-btn)] font-semibold" disabled={savingPassword}>
              Hủy
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-gradient-purple text-white rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] font-semibold hover-lift"
              disabled={savingPassword}
            >
              {savingPassword ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang đổi...</>
              ) : "Đổi mật khẩu"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { key: "current" as const, label: "Mật khẩu hiện tại" },
            { key: "new" as const, label: "Mật khẩu mới" },
            { key: "confirm" as const, label: "Xác nhận mật khẩu mới" },
          ].map(field => (
            <div key={field.key} className="space-y-2">
              <Label className="font-semibold">{field.label}</Label>
              <div className="relative">
                <Input
                  type={showPass[field.key] ? "text" : "password"}
                  value={passwords[field.key]}
                  onChange={e => setPasswords({ ...passwords, [field.key]: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple-deep)] pr-10"
                  disabled={savingPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
                  onClick={() => setShowPass(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                >
                  {showPass[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          {passwords.new && passwords.new.length < 5 && (
            <p className="text-xs text-[var(--danger)]">⚠️ Mật khẩu phải có ít nhất 5 ký tự</p>
          )}
          {passwords.confirm && passwords.new !== passwords.confirm && (
            <p className="text-xs text-[var(--danger)]">⚠️ Mật khẩu không khớp</p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa tài khoản vĩnh viễn?"
        message="Bạn có chắc chắn muốn xóa tài khoản của mình không? Hành động này không thể hoàn tác và tất cả dữ liệu cá nhân của bạn sẽ bị xóa sạch."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        type="danger"
      />

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => { setShow2FAModal(false); setTwoFactorData(null); setTwoFactorCode(""); }}
        title="Cài đặt xác thực 2 bước (TOTP)"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShow2FAModal(false); setTwoFactorData(null); setTwoFactorCode(""); }} className="rounded-[var(--radius-btn)] font-semibold" disabled={saving2FA}>
              Hủy
            </Button>
            <Button
              onClick={handleEnable2FA}
              className="bg-gradient-purple text-white rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] font-semibold hover-lift"
              disabled={saving2FA || twoFactorCode.length < 6}
            >
              {saving2FA ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xác minh...</> : "Bật 2FA"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Mở ứng dụng xác thực (Google Authenticator, Authy…) và thêm tài khoản bằng cách nhập thủ công khóa bí mật bên dưới.
          </p>
          {twoFactorData && (
            <div className="bg-[var(--card-bg)] rounded-[var(--radius-sm)] p-3 border border-[var(--border-light)]">
              <p className="text-xs text-[var(--text-muted)] mb-1 font-semibold">Khóa bí mật (Manual Key)</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-[var(--purple-deep)] break-all flex-1">{twoFactorData.secret}</code>
                <button
                  type="button"
                  className="text-[var(--text-muted)] hover:text-[var(--purple-deep)] transition-smooth flex-shrink-0"
                  onClick={() => { navigator.clipboard.writeText(twoFactorData.secret); info("📋 Đã sao chép", "Khóa bí mật đã được sao chép."); }}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label className="font-semibold">Mã OTP 6 chữ số</Label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] text-center text-2xl font-mono tracking-widest focus-visible:ring-[var(--purple-deep)]"
              disabled={saving2FA}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
