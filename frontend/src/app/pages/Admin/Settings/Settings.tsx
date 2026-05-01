import { useState } from "react";
import { Settings as SettingsIcon, Save, Bell, Shield, Mail, Database, Globe, Zap } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { PageHeader } from "../../../components/common/PageHeader";
import { toast } from "../../../components/common/Toast";

export function Settings() {
  const [settings, setSettings] = useState({
    // General
    siteName: "Đi Chợ Tiện Lợi",
    siteDescription: "Ứng dụng quản lý mua sắm thông minh",
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationEmail: "admin@dichotienloi.com",

    // Security
    twoFactorAuth: true,
    sessionTimeout: "3600",
    passwordExpiry: "90",
    maxLoginAttempts: "5",

    // Email
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "noreply@dichotienloi.com",
    smtpPassword: "••••••••",

    // Backup
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30",

    // Performance
    cacheEnabled: true,
    compressionEnabled: true,
    cdnEnabled: false,
  });

  const handleSave = () => {
    toast.success("Đã lưu cài đặt thành công!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt hệ thống"
        description="Quản lý và cấu hình hệ thống"
        icon={SettingsIcon}
        action={
          <Button
            onClick={handleSave}
            className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold"
          >
            <Save className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Lưu thay đổi
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-[var(--border-light)] shadow-sm rounded-[var(--radius-sm)] p-1.5 flex-wrap h-auto">
          <TabsTrigger
            value="general"
            className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            <Globe className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Chung
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            <Bell className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Thông báo
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            <Shield className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            <Mail className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Email
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            <Database className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Sao lưu
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            <Zap className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Hiệu suất
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] animate-slide-up bg-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-black text-[var(--text-dark)]">Cài đặt chung</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-[var(--text-dark)] font-semibold">
                    Tên trang web
                  </Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-[var(--text-dark)] font-semibold">
                    Ngôn ngữ
                  </Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                    <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[var(--radius-sm)]">
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-[var(--text-dark)] font-semibold">
                  Mô tả trang web
                </Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-[var(--text-dark)] font-semibold">
                  Múi giờ
                </Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                  <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[var(--radius-sm)]">
                    <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</SelectItem>
                    <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] animate-slide-up bg-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-black text-[var(--text-dark)]">Cài đặt thông báo</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-dark)]">Thông báo Email</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Nhận thông báo qua email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-dark)]">Thông báo đẩy</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Nhận thông báo đẩy trên trình duyệt</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-dark)]">Thông báo SMS</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Nhận thông báo qua tin nhắn SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationEmail" className="text-[var(--text-dark)] font-semibold">
                  Email nhận thông báo
                </Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] animate-slide-up bg-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-black text-[var(--text-dark)]">Cài đặt bảo mật</h3>

              <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                <div className="flex-1">
                  <p className="font-bold text-[var(--text-dark)]">Xác thực 2 bước</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Yêu cầu mã xác thực khi đăng nhập</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout" className="text-[var(--text-dark)] font-semibold">
                    Thời gian phiên (giây)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                    className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry" className="text-[var(--text-dark)] font-semibold">
                    Hết hạn mật khẩu (ngày)
                  </Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => setSettings({ ...settings, passwordExpiry: e.target.value })}
                    className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts" className="text-[var(--text-dark)] font-semibold">
                  Số lần đăng nhập tối đa
                </Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                  className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] animate-slide-up bg-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-black text-[var(--text-dark)]">Cài đặt SMTP</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost" className="text-[var(--text-dark)] font-semibold">
                    SMTP Host
                  </Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="text-[var(--text-dark)] font-semibold">
                    SMTP Port
                  </Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                    className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUsername" className="text-[var(--text-dark)] font-semibold">
                  SMTP Username
                </Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
                  className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword" className="text-[var(--text-dark)] font-semibold">
                  SMTP Password
                </Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                  className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] animate-slide-up bg-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-black text-[var(--text-dark)]">Cài đặt sao lưu</h3>

              <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                <div className="flex-1">
                  <p className="font-bold text-[var(--text-dark)]">Tự động sao lưu</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Tự động sao lưu dữ liệu định kỳ</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency" className="text-[var(--text-dark)] font-semibold">
                    Tần suất sao lưu
                  </Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                  >
                    <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[var(--radius-sm)]">
                      <SelectItem value="hourly">Mỗi giờ</SelectItem>
                      <SelectItem value="daily">Mỗi ngày</SelectItem>
                      <SelectItem value="weekly">Mỗi tuần</SelectItem>
                      <SelectItem value="monthly">Mỗi tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupRetention" className="text-[var(--text-dark)] font-semibold">
                    Lưu trữ (ngày)
                  </Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    value={settings.backupRetention}
                    onChange={(e) => setSettings({ ...settings, backupRetention: e.target.value })}
                    className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] animate-slide-up bg-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-black text-[var(--text-dark)]">Cài đặt hiệu suất</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-dark)]">Bật Cache</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Lưu trữ tạm để tăng tốc độ</p>
                  </div>
                  <Switch
                    checked={settings.cacheEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, cacheEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-dark)]">Nén dữ liệu</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Giảm kích thước dữ liệu truyền tải</p>
                  </div>
                  <Switch
                    checked={settings.compressionEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, compressionEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-dark)]">Sử dụng CDN</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Phân phối nội dung toàn cầu</p>
                  </div>
                  <Switch
                    checked={settings.cdnEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, cdnEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
