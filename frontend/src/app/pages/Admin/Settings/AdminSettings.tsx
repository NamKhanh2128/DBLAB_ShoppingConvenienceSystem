import { useState } from "react";
import { Settings, Save, Server, Shield, Bell, CreditCard, Users, Globe, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { PageHeader } from "../../../components/common/PageHeader";
import { toast } from "../../../components/common/Toast";

export function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = (section: string) => {
    setIsSaving(true);
    toast.info(`Đang lưu cấu hình ${section}...`);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`Cấu hình ${section} đã được lưu thành công!`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt hệ thống"
        description="Quản lý các cấu hình và thiết lập tổng quát của ứng dụng"
        icon={Settings}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-[var(--border-light)] shadow-sm rounded-[var(--radius-sm)] p-1.5 flex overflow-x-auto w-full md:w-auto">
          <TabsTrigger value="general" className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-4">
            <Globe className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Hệ thống
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-4">
            <Users className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="payment" className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-4">
            <CreditCard className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-4">
            <Shield className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="animate-slide-up">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
            <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-100 rounded-[10px] flex items-center justify-center">
                    <Server className="w-5 h-5 text-[var(--purple-deep)]" strokeWidth={2.5} />
                 </div>
                 <div>
                   <CardTitle className="text-xl font-black text-[var(--text-dark)]">Cấu hình chung</CardTitle>
                   <CardDescription className="text-sm font-medium text-[var(--text-muted)]">Thiết lập thông tin ứng dụng cơ bản.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-[var(--text-dark)]">Tên ứng dụng</Label>
                  <Input defaultValue="Nateat Grocery System" className="bg-[var(--card-bg)] border-[var(--border-light)] rounded-[var(--radius-sm)] focus-visible:ring-[var(--purple-deep)]" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[var(--text-dark)]">Email liên hệ</Label>
                  <Input defaultValue="support@nateat.com" type="email" className="bg-[var(--card-bg)] border-[var(--border-light)] rounded-[var(--radius-sm)] focus-visible:ring-[var(--purple-deep)]" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[var(--text-dark)]">Ngôn ngữ mặc định</Label>
                  <Select defaultValue="vi">
                    <SelectTrigger className="bg-[var(--card-bg)] border-[var(--border-light)] rounded-[var(--radius-sm)] focus:ring-[var(--purple-deep)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[var(--radius-sm)]">
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[var(--text-dark)]">Múi giờ</Label>
                  <Select defaultValue="asia_hcm">
                    <SelectTrigger className="bg-[var(--card-bg)] border-[var(--border-light)] rounded-[var(--radius-sm)] focus:ring-[var(--purple-deep)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[var(--radius-sm)]">
                      <SelectItem value="asia_hcm">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border-light)] flex justify-end">
                <Button 
                  onClick={() => handleSave("hệ thống")} 
                  disabled={isSaving}
                  className="bg-gradient-purple text-white shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-sm)] font-semibold px-6"
                >
                  <Save className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="animate-slide-up">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
            <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-100 rounded-[10px] flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                 </div>
                 <div>
                   <CardTitle className="text-xl font-black text-[var(--text-dark)]">Tính năng người dùng</CardTitle>
                   <CardDescription className="text-sm font-medium text-[var(--text-muted)]">Kiểm soát hành vi đăng ký và phân quyền.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)] border border-[var(--border-light)]">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold text-[var(--text-dark)]">Cho phép đăng ký mới</Label>
                    <p className="text-sm text-[var(--text-muted)]">Mở cửa cho người dùng mới tạo tài khoản.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)] border border-[var(--border-light)]">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold text-[var(--text-dark)]">Xác thực Email</Label>
                    <p className="text-sm text-[var(--text-muted)]">Bắt buộc xác thực email trước khi sử dụng hệ thống.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border-light)] flex justify-end">
                <Button 
                  onClick={() => handleSave("người dùng")} 
                  disabled={isSaving}
                  className="bg-gradient-purple text-white shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-sm)] font-semibold px-6"
                >
                  <Save className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="animate-slide-up">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
            <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-[10px] flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[var(--gold)]" strokeWidth={2.5} />
                 </div>
                 <div>
                   <CardTitle className="text-xl font-black text-[var(--text-dark)]">Cổng Thanh Toán</CardTitle>
                   <CardDescription className="text-sm font-medium text-[var(--text-muted)]">Thiết lập kết nối với các cổng thanh toán.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                 <div className="space-y-2">
                    <Label className="font-bold text-[var(--text-dark)]">Đơn vị tiền tệ mặc định</Label>
                    <Select defaultValue="vnd">
                      <SelectTrigger className="bg-[var(--card-bg)] border-[var(--border-light)] rounded-[var(--radius-sm)] focus:ring-[var(--purple-deep)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[var(--radius-sm)]">
                        <SelectItem value="vnd">VND - Đồng Việt Nam</SelectItem>
                        <SelectItem value="usd">USD - Đô la Mỹ</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-4">
                    <h4 className="font-bold text-[var(--text-dark)] flex items-center gap-2">
                       Tích hợp MoMo
                       <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>MoMo Partner Code</Label>
                          <Input defaultValue="MOMONAT2024" type="password" className="bg-[var(--card-bg)] border-[var(--border-light)] rounded-[var(--radius-sm)]" />
                       </div>
                       <div className="space-y-2">
                          <Label>MoMo Access Key</Label>
                          <Input defaultValue="****************" type="password" className="bg-[var(--card-bg)] border-[var(--border-light)] rounded-[var(--radius-sm)]" />
                       </div>
                    </div>
                 </div>
              </div>
              <div className="pt-4 border-t border-[var(--border-light)] flex justify-end">
                <Button 
                  onClick={() => handleSave("thanh toán")} 
                  disabled={isSaving}
                  className="bg-gradient-purple text-white shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-sm)] font-semibold px-6"
                >
                  <Save className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-slide-up">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
             <CardHeader className="bg-[var(--card-bg)] border-b border-[var(--border-light)]">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-[10px] flex items-center justify-center">
                     <Shield className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-[var(--text-dark)]">Bảo mật</CardTitle>
                    <CardDescription className="text-sm font-medium text-[var(--text-muted)]">Thiết lập an toàn và xác thực hai bước.</CardDescription>
                  </div>
               </div>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)] border border-[var(--border-light)] gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold text-[var(--text-dark)] flex items-center gap-2">
                         <Mail className="w-4 h-4 text-[var(--purple-deep)]" />
                         Cảnh báo đăng nhập thất bại
                      </Label>
                      <p className="text-sm text-[var(--text-muted)]">Gửi email cho ban quản trị khi có IP đăng nhập sai mật khẩu quá 5 lần.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)] border border-[var(--border-light)] gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold text-[var(--text-dark)] flex items-center gap-2">
                         <Bell className="w-4 h-4 text-[var(--purple-deep)]" />
                         Phiên đăng nhập tự động (Timeout)
                      </Label>
                      <p className="text-sm text-[var(--text-muted)]">Thời gian tự động đăng xuất nếu không có tương tác.</p>
                    </div>
                    <Select defaultValue="60">
                      <SelectTrigger className="w-[180px] bg-white border-[var(--border-light)] rounded-[var(--radius-sm)] focus:ring-[var(--purple-deep)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[var(--radius-sm)]">
                         <SelectItem value="30">30 phút</SelectItem>
                         <SelectItem value="60">1 tiếng</SelectItem>
                         <SelectItem value="120">2 tiếng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--border-light)] flex justify-end">
                  <Button 
                    onClick={() => handleSave("bảo mật")} 
                    disabled={isSaving}
                    className="bg-gradient-purple text-white shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-sm)] font-semibold px-6"
                  >
                    <Save className="w-4 h-4 mr-2" strokeWidth={2.5} />
                    Lưu thay đổi
                  </Button>
                </div>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
