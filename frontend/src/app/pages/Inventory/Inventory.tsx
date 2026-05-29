import { useState, useMemo, useEffect } from "react";
import { 
  Plus, Search, Filter, AlertTriangle, Calendar, MapPin, Eye, Trash2, 
  ArrowRight, Loader2, RefreshCw, Barcode, History, ShoppingBag, 
  Layers, Package, Check, HelpCircle, User, Minimize2, ChevronDown, ChevronUp 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToastContext } from "../../context/ToastContext";
import {
  AddInventoryItemModal,
  ViewInventoryDetailsModal,
  UseInventoryModal,
  FilterModal,
  ConfirmDialog,
} from "../../components/common";
import { useInventory } from "../../hooks/useData";
import { getExpiryStatus, INVENTORY_UNITS } from "../../utils/inventory";

// Mock Barcode products list for simulated scanner
const MOCK_PRODUCTS = [
  { barcode: "8934563123456", name: "Sữa tươi Vinamilk 100% ít đường", quantity: 4, unit: "hộp", location: "Tủ lạnh", category: "Sữa", expiryDays: 10 },
  { barcode: "8935001928374", name: "Trứng gà Ba Huân (Hộp 10 quả)", quantity: 1, unit: "hộp", location: "Tủ lạnh", category: "Trứng", expiryDays: 14 },
  { barcode: "8936012938475", name: "Thịt ba chỉ heo CP (Khay 500g)", quantity: 0.5, unit: "kg", location: "Ngăn đông", category: "Thịt", expiryDays: 30 },
  { barcode: "8935213847561", name: "Táo Fuji đỏ chín mọng nhập khẩu", quantity: 6, unit: "quả", location: "Tủ lạnh", category: "Trái cây", expiryDays: 7 },
  { barcode: "8934827162534", name: "Mì ăn liền Hảo Hảo Tôm chua cay", quantity: 12, unit: "gói", location: "Tủ bếp", category: "Đồ khô", expiryDays: 180 },
];

export function Inventory() {
  const { success, error, info } = useToastContext();
  const { items: rawItems, expiring, logs, loading, addItem, updateItem, deleteItem, reload } = useInventory();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [expiryFilter, setExpiryFilter] = useState("all"); // all, critical, warning, good, none
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [groupDuplicates, setGroupDuplicates] = useState(true); // Gộp các mặt hàng cùng tên

  // Accordion state for grouped items
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Modals state
  const [showAddItem, setShowAddItem] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [useItemModal, setUseItemModal] = useState<any>(null);
  const [deleteItemModal, setDeleteItemModal] = useState<any>(null);

  // Quick form state
  const [formName, setFormName] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formUnit, setFormUnit] = useState("cái");
  const [formLocation, setFormLocation] = useState("Tủ lạnh");
  const [formExpiry, setFormExpiry] = useState("");
  const [formCategory, setFormCategory] = useState("Rau củ");
  const [formNotes, setFormNotes] = useState("");

  // Barcode Scanner Simulator state
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Right column tab (Quick add vs logs)
  const [rightTab, setRightTab] = useState("add");

  // Map backend food row to enriched UI row
  const enrichedItems = useMemo(() => {
    return rawItems.map((raw: any) => {
      const expiryInfo = getExpiryStatus(raw.HanSuDung);
      return {
        id: raw.MaTP,
        name: raw.TenTP,
        quantity: raw.SoLuong,
        unit: raw.DonVi || "cái",
        location: raw.ViTri || "Chưa xác định",
        expiryDate: raw.HanSuDung ? raw.HanSuDung.split('T')[0] : null,
        expiryStatus: expiryInfo.status,
        expiryText: expiryInfo.text,
        expiryBadge: expiryInfo.badgeClass,
        expiryTextClass: expiryInfo.textClass,
        expiryIcon: expiryInfo.icon,
        version: raw.Version || 1,
        trangThai: raw.TrangThai || 'CON_HAN',
        _raw: raw,
      };
    });
  }, [rawItems]);

  // Group duplicate items by name (if toggle enabled)
  const processedItems = useMemo(() => {
    if (!groupDuplicates) {
      return enrichedItems.map(item => ({ ...item, isGroup: false, batches: [item] }));
    }

    const groups: Record<string, typeof enrichedItems> = {};
    enrichedItems.forEach(item => {
      const key = item.name.toLowerCase().trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.keys(groups).map(key => {
      const batches = groups[key].sort((a, b) => {
        // Sort by expiry: expired first, then closest expiry, then no expiry
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
      const first = batches[0];
      const totalQty = batches.reduce((sum, item) => sum + item.quantity, 0);

      // Determine overall group expiry status
      let overallStatus = "good";
      if (batches.some(b => b.expiryStatus === "critical")) overallStatus = "critical";
      else if (batches.some(b => b.expiryStatus === "warning")) overallStatus = "warning";
      else if (batches.every(b => b.expiryStatus === "none")) overallStatus = "none";

      const expiryInfo = batches.find(b => b.expiryStatus !== "none" && b.expiryStatus !== "good") || first;

      return {
        id: `group-${key}`,
        name: first.name,
        quantity: totalQty,
        unit: first.unit,
        location: first.location,
        expiryDate: first.expiryDate,
        expiryStatus: overallStatus,
        expiryText: expiryInfo.expiryText,
        expiryBadge: expiryInfo.expiryBadge,
        expiryTextClass: expiryInfo.expiryTextClass,
        expiryIcon: expiryInfo.expiryIcon,
        version: first.version,
        trangThai: first.trangThai,
        isGroup: batches.length > 1,
        batches: batches
      };
    });
  }, [enrichedItems, groupDuplicates]);

  // Filters application
  const filteredItems = useMemo(() => {
    return processedItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation =
        selectedLocation === "Tất cả" ||
        item.location === selectedLocation ||
        (item.isGroup && item.batches.some(b => b.location === selectedLocation));

      const matchesExpiry =
        expiryFilter === "all" ||
        item.expiryStatus === expiryFilter ||
        (item.isGroup && item.batches.some(b => b.expiryStatus === expiryFilter));

      const matchesLowStock = !lowStockOnly || item.quantity <= 2;

      return matchesSearch && matchesLocation && matchesExpiry && matchesLowStock;
    });
  }, [processedItems, searchQuery, selectedLocation, expiryFilter, lowStockOnly]);

  // Form utilities
  const handleSetExpiryDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormExpiry(d.toISOString().split("T")[0]);
  };

  const handleSimulateScan = (product: typeof MOCK_PRODUCTS[0]) => {
    setIsScanning(true);
    setTimeout(() => {
      setFormName(product.name);
      setFormQty(product.quantity.toString());
      setFormUnit(product.unit);
      setFormLocation(product.location);
      setFormCategory(product.category);
      handleSetExpiryDays(product.expiryDays);
      setFormNotes(`Quét mã vạch: ${product.barcode}`);
      setIsScanning(false);
      setShowScanner(false);
      success("✅ Quét thành công!", `Đã nhận diện sản phẩm: ${product.name}`);
    }, 1200);
  };

  // CRUD handlers
  const handleAddSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName) {
      error("Lỗi", "Vui lòng nhập tên thực phẩm");
      return;
    }
    const qty = parseFloat(formQty);
    if (isNaN(qty) || qty < 0) {
      error("Lỗi", "Số lượng phải là số không âm");
      return;
    }

    try {
      await addItem({
        tenTP: formName,
        soLuong: qty,
        donVi: formUnit,
        hanSuDung: formExpiry || null,
        viTri: formLocation,
      });

      success("✅ Thành công!", `"${formName}" đã được thêm vào kho.`);
      
      // Clear form
      setFormName("");
      setFormQty("");
      setFormUnit("cái");
      setFormExpiry("");
      setFormNotes("");
    } catch (e: any) {
      error("Không thể thêm thực phẩm", e.message || "Lỗi hệ thống");
    }
  };

  const handleUseItemSubmit = async (data: any) => {
    if (!useItemModal) return;
    try {
      const amount = parseFloat(data.quantity || 1);
      const newQty = Math.max(0, useItemModal.quantity - amount);
      
      // Gửi kèm version để kiểm soát xung đột OCC
      await updateItem(useItemModal.id, {
        soLuong: newQty,
        trangThai: newQty === 0 ? "HONG" : useItemModal.trangThai,
        viTri: useItemModal.location,
        version: useItemModal.version
      });

      success("✅ Cập nhật kho thành công!", `Đã dùng ${amount} ${useItemModal.unit} "${useItemModal.name}".`);
      setUseItemModal(null);
    } catch (e: any) {
      // Bắt lỗi OCC 409 Conflict
      error("Lỗi cập nhật", e.message || "Vật phẩm đã bị chỉnh sửa bởi người khác.");
      reload(); // Reload data immediately to reflect standard state
    }
  };

  const handleQuickDecrement = async (item: any, amt: number = 1) => {
    try {
      const newQty = Math.max(0, item.quantity - amt);
      await updateItem(item.id, {
        soLuong: newQty,
        trangThai: newQty === 0 ? "HONG" : item.trangThai,
        viTri: item.location,
        version: item.version
      });
      success("✅ Tiêu thụ thành công!", `Đã giảm ${amt} ${item.unit} "${item.name}".`);
    } catch (e: any) {
      error("Lỗi xung đột dữ liệu (OCC)", e.message || "Ai đó vừa cập nhật vật phẩm này. Đang tải lại...");
      reload();
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemModal) return;
    try {
      await deleteItem(deleteItemModal.id);
      success(`🗑️ Đã xóa vật phẩm`, `"${deleteItemModal.name}" đã được dọn khỏi kho.`);
      setDeleteItemModal(null);
    } catch (e: any) {
      error("Lỗi", e.message || "Không thể xóa");
    }
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-light)] pb-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] tracking-tight mb-1 flex items-center gap-2">
            Kho thực phẩm <span className="text-xl">🏪</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium">
            Quản lý tủ lạnh, ngăn đá và tủ khô thông minh gia đình.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={reload} 
            variant="outline" 
            className="rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[var(--success)]" : ""}`} />
            Làm mới
          </Button>
          <Button
            className="bg-gradient-to-r from-[var(--success)] to-[#16A34A] text-white font-bold shadow-md hover-lift rounded-[var(--radius-btn)] py-2 px-4 text-xs"
            onClick={() => setShowAddItem(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
            Thêm thủ công
          </Button>
        </div>
      </div>

      {/* ─── MAIN 3-COLUMN GRID LAYOUT ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =================================================================
            CỘT TRÁI (LỌC & THỐNG KÊ): Lọc thông minh, gộp mặt hàng, stats
           ================================================================= */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none shadow-[var(--shadow-card)] bg-gradient-to-br from-[var(--purple-deep)]/5 to-[var(--purple-deep)]/10 text-center rounded-[var(--radius)]">
              <CardContent className="p-3">
                <p className="text-2xl font-black text-[var(--purple-deep)]">{loading ? "..." : rawItems.length}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">Tổng vật phẩm</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[var(--shadow-card)] bg-gradient-to-br from-red-500/5 to-red-500/10 text-center rounded-[var(--radius)]">
              <CardContent className="p-3">
                <p className="text-2xl font-black text-red-600">{loading ? "..." : expiring.length}</p>
                <p className="text-[10px] text-red-600/70 font-semibold mt-0.5">Sắp/Đã hết hạn</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Panel */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
            <CardHeader className="p-4 pb-2 border-b border-[var(--border-light)]">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-[var(--text-dark)]">
                <span>Bộ lọc thông minh</span>
                <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 space-y-5 text-sm">
              
              {/* Location tabs */}
              <div className="space-y-2">
                <span className="font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider block">Khu vực lưu trữ</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {["Tất cả", "Tủ lạnh", "Ngăn đông", "Tủ bếp", "Kệ đồ"].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={`py-1.5 px-2 rounded-[var(--radius-sm)] font-semibold text-xs border transition-all text-left truncate ${
                        selectedLocation === loc
                          ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]"
                          : "border-[var(--border-light)] hover:bg-[var(--card-bg)] text-[var(--text-muted)]"
                      }`}
                    >
                      {loc === "Tất cả" ? "🌐 Tất cả" : loc === "Tủ lạnh" ? "🧊 Tủ lạnh" : loc === "Ngăn đông" ? "❄️ Ngăn đông" : loc === "Tủ bếp" ? "🍳 Tủ bếp" : "📦 Kệ đồ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry filter */}
              <div className="space-y-2">
                <span className="font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider block">Tình trạng hạn dùng</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    { value: "all", label: "Tất cả thực phẩm" },
                    { value: "critical", label: "🚨 Hết hạn / Gấp gáp" },
                    { value: "warning", label: "⏳ Sắp hết hạn" },
                    { value: "good", label: "✅ Còn hạn tốt" },
                    { value: "none", label: "♾️ Không có HSD" }
                  ].map((exp) => (
                    <label key={exp.value} className="flex items-center gap-2 font-medium cursor-pointer text-xs text-[var(--text-muted)]">
                      <input
                        type="radio"
                        name="expiryFilter"
                        checked={expiryFilter === exp.value}
                        onChange={() => setExpiryFilter(exp.value)}
                        className="rounded-full text-[var(--success)] focus:ring-[var(--success)]"
                      />
                      <span className={expiryFilter === exp.value ? "text-[var(--text-dark)] font-bold" : ""}>
                        {exp.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group toggle & Low stock checkbox */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-light)]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-dark)]">
                  <input
                    type="checkbox"
                    checked={groupDuplicates}
                    onChange={(e) => setGroupDuplicates(e.target.checked)}
                    className="rounded text-[var(--success)] focus:ring-[var(--success)]"
                  />
                  <Layers className="w-3.5 h-3.5 text-[var(--purple-deep)]" />
                  Gộp các mặt hàng cùng tên
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-dark)]">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="rounded text-[var(--success)] focus:ring-[var(--success)]"
                  />
                  <ShoppingBag className="w-3.5 h-3.5 text-[var(--danger)]" />
                  Chỉ hiện thực phẩm sắp hết (≤ 2)
                </label>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* =================================================================
            CỘT GIỮA (DANH SÁCH THỰC PHẨM): Tìm kiếm, Grid Cards, accordion
           ================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              placeholder="Tìm nhanh thực phẩm theo tên..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-[var(--border-light)] focus-visible:ring-[var(--success)] focus-visible:border-[var(--success)] rounded-[var(--radius-sm)] font-medium shadow-[var(--shadow-card)]"
            />
          </div>

          {/* Core Food Grid */}
          {loading && rawItems.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-[var(--radius)] shadow-[var(--shadow-card)] border border-[var(--border-light)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--success)]" />
              <span className="mt-3 text-xs text-[var(--text-muted)] font-semibold">Đang đồng bộ và kiểm tra hạn sử dụng...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[var(--radius)] shadow-[var(--shadow-card)] border border-[var(--border-light)] text-[var(--text-muted)]">
              <span className="text-5xl">🍉</span>
              <p className="font-bold text-sm mt-3 text-[var(--text-dark)]">Không tìm thấy thực phẩm trùng khớp</p>
              <p className="text-xs mt-1">Vui lòng điều chỉnh bộ lọc hoặc thêm món đồ mới.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isGrouped = item.isGroup;
                const isExpanded = expandedGroups[item.id] || false;

                return (
                  <div key={item.id} className="bg-white rounded-[var(--radius)] shadow-[var(--shadow-card)] border border-[var(--border-light)] overflow-hidden transition-all hover:shadow-md">
                    
                    {/* Main card representation */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Food Icon box based on category */}
                        <div className="w-12 h-12 bg-[var(--card-bg)] rounded-xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                          {item.name.toLowerCase().includes("sữa") ? "🥛" : 
                           item.name.toLowerCase().includes("trứng") ? "🥚" :
                           item.name.toLowerCase().includes("thịt") ? "🥩" :
                           item.name.toLowerCase().includes("táo") || item.name.toLowerCase().includes("hoa quả") ? "🍎" :
                           item.name.toLowerCase().includes("rau") ? "🥦" : "🥗"}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-[var(--text-dark)] flex items-center gap-1.5">
                            <span className="truncate">{item.name}</span>
                            {isGrouped && (
                              <Badge className="bg-[var(--purple-deep)]/10 text-[var(--purple-deep)] hover:bg-[var(--purple-deep)]/10 text-[9px] font-black tracking-wider py-0 px-1 border-none rounded">
                                GỘP {item.batches.length} LÔ
                              </Badge>
                            )}
                          </h3>

                          {/* Quick details */}
                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-semibold mt-1">
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 py-0.5 px-1.5 rounded font-bold">
                              {item.quantity} {item.unit}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {item.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right actions & Badges */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Expiry Badge */}
                        <div className="text-right hidden sm:block">
                          <Badge className={`font-semibold border-none text-[10px] py-1 px-2 rounded-full ${item.expiryBadge}`}>
                            {item.expiryIcon} {item.expiryText}
                          </Badge>
                        </div>

                        {/* Actions group */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 hover:bg-[var(--success)]/10 hover:text-[var(--success)]"
                            onClick={() => handleQuickDecrement(item.isGroup ? item.batches[0] : item, 1)}
                            disabled={item.quantity <= 0}
                            title="Tiêu thụ 1"
                          >
                            <span className="font-bold text-xs">-1</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 hover:bg-[var(--success)]/20 hover:text-[var(--success)]"
                            onClick={() => setUseItemModal(item.isGroup ? item.batches[0] : item)}
                            title="Tiêu thụ tùy chọn"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 hover:bg-red-50 hover:text-red-500"
                            onClick={() => setDeleteItemModal(item.isGroup ? item.batches[0] : item)}
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          
                          {/* Accordion toggle if grouped */}
                          {isGrouped && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-7 h-7 hover:bg-gray-100"
                              onClick={() => toggleGroupExpand(item.id)}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Expiry Badge for small mobile screens */}
                    <div className="px-4 pb-3 flex sm:hidden">
                      <Badge className={`font-semibold border-none text-[9px] py-0.5 px-2 rounded-full ${item.expiryBadge}`}>
                        {item.expiryIcon} {item.expiryText}
                      </Badge>
                    </div>

                    {/* Group Batches Expansion (OCC and individual data displayed gracefully) */}
                    {isGrouped && isExpanded && (
                      <div className="bg-gray-50 border-t border-[var(--border-light)] p-3 space-y-2 text-xs">
                        <div className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 px-1">
                          Chi tiết các lô hàng trong kho
                        </div>
                        {item.batches.map((batch: any, index: number) => (
                          <div key={batch.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-2 hover:shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-400">Lô {index + 1}:</span>
                              <span className="font-bold text-gray-800">{batch.quantity} {batch.unit}</span>
                              <span className="text-[10px] text-gray-400">|</span>
                              <span className="text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                HSD: {batch.expiryDate || "Không có"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Badge className={`text-[9px] font-semibold border-none rounded py-0.5 px-1.5 ${batch.expiryBadge}`}>
                                {batch.expiryIcon} {batch.expiryText}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 py-0 px-2 text-[10px] text-[var(--success)] border-[var(--success)] hover:bg-[var(--success)] hover:text-white transition-smooth"
                                onClick={() => handleQuickDecrement(batch, 1)}
                              >
                                -1 {batch.unit}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 rounded"
                                onClick={() => setDeleteItemModal(batch)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* =================================================================
            CỘT PHẢI (ACTIVITY AUDIT LOG & QUICK ADD): Scanner, shortcuts, logs
           ================================================================= */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tab Controller */}
          <div className="bg-white p-1 rounded-xl shadow-[var(--shadow-card)] border border-[var(--border-light)] grid grid-cols-2">
            <button
              onClick={() => setRightTab("add")}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                rightTab === "add"
                  ? "bg-gradient-to-r from-[var(--success)] to-[#16A34A] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-gray-100"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm Nhanh
            </button>
            <button
              onClick={() => setRightTab("logs")}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                rightTab === "logs"
                  ? "bg-gradient-to-r from-[var(--success)] to-[#16A34A] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-gray-100"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Nhật Ký Kho
            </button>
          </div>

          {/* TAB CONTENT: QUICK ADD */}
          {rightTab === "add" && (
            <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-[var(--border-light)]">
                <CardTitle className="text-xs font-bold text-[var(--text-dark)] uppercase tracking-wider flex items-center justify-between">
                  <span>Nhập kho siêu tốc</span>
                  <Barcode className="w-4 h-4 text-[var(--success)]" />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4">
                
                {/* Barcode Simulator triggers */}
                <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-7xl opacity-5">🛒</div>
                  <h4 className="font-black text-xs text-[var(--success)] flex items-center gap-1 mb-1">
                    <Barcode className="w-4 h-4" />
                    Quét Mã Vạch Hóa Đơn
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold mb-3 leading-relaxed">
                    Vừa đi siêu thị về? Bấm để giả lập quét camera tự động nhận diện thực phẩm.
                  </p>
                  
                  {showScanner ? (
                    <div className="bg-white border border-dashed border-emerald-500/50 rounded-lg p-2.5 space-y-2">
                      <p className="font-bold text-[9px] text-emerald-600 animate-pulse text-center">
                        MÔ PHỎNG CAMERA: CHỌN SẢN PHẨM QUÉT
                      </p>
                      <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
                        {MOCK_PRODUCTS.map((p) => (
                          <button
                            key={p.barcode}
                            onClick={() => handleSimulateScan(p)}
                            disabled={isScanning}
                            className="bg-gray-50 hover:bg-[var(--success)]/10 border border-gray-100 hover:border-[var(--success)] p-1.5 rounded text-left transition-all flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-[10px] truncate text-[var(--text-dark)]">{p.name}</p>
                              <p className="text-[8px] text-[var(--text-muted)] font-bold font-mono">CODE: {p.barcode}</p>
                            </div>
                            <span className="text-xs flex-shrink-0 bg-white border py-0.5 px-1 rounded font-bold shadow-sm">
                              {p.quantity} {p.unit}
                            </span>
                          </button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-[10px] h-7 font-bold text-red-500 hover:bg-red-50"
                        onClick={() => setShowScanner(false)}
                      >
                        Tắt giả lập quét
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowScanner(true)}
                      className="w-full bg-[var(--success)] text-white hover:bg-[var(--success)]/90 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      Mở Giả Lập Quét Camera
                    </Button>
                  )}
                </div>

                {/* Inline form inputs */}
                <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs text-[var(--text-dark)]">
                  <div>
                    <label className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Tên thực phẩm</label>
                    <Input
                      placeholder="Nhập tên, VD: Cà chua đỏ"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="h-9 border-[var(--border-light)] focus-visible:ring-[var(--success)] focus-visible:border-[var(--success)] rounded-[var(--radius-sm)]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Số lượng</label>
                      <Input
                        type="number"
                        placeholder="VD: 5"
                        value={formQty}
                        onChange={(e) => setFormQty(e.target.value)}
                        className="h-9 border-[var(--border-light)] focus-visible:ring-[var(--success)] focus-visible:border-[var(--success)] rounded-[var(--radius-sm)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Đơn vị</label>
                      <select
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        className="w-full h-9 bg-white border border-[var(--border-light)] rounded-[var(--radius-sm)] px-2.5 font-semibold text-xs text-[var(--text-dark)] focus:outline-none focus:ring-1 focus:ring-[var(--success)] focus:border-[var(--success)]"
                      >
                        {INVENTORY_UNITS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Vị trí cất</label>
                      <select
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full h-9 bg-white border border-[var(--border-light)] rounded-[var(--radius-sm)] px-2.5 font-semibold text-xs text-[var(--text-dark)] focus:outline-none focus:ring-1 focus:ring-[var(--success)] focus:border-[var(--success)]"
                      >
                        <option value="Tủ lạnh">🧊 Tủ lạnh</option>
                        <option value="Ngăn đông">❄️ Ngăn đông</option>
                        <option value="Tủ bếp">🍳 Tủ bếp</option>
                        <option value="Kệ đồ">📦 Kệ đồ</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Hạn sử dụng</label>
                      <Input
                        type="date"
                        value={formExpiry}
                        onChange={(e) => setFormExpiry(e.target.value)}
                        className="h-9 border-[var(--border-light)] focus-visible:ring-[var(--success)] focus-visible:border-[var(--success)] rounded-[var(--radius-sm)]"
                      />
                    </div>
                  </div>

                  {/* Expiration date quick selector shortcuts */}
                  <div className="space-y-1">
                    <span className="font-bold text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Phím tắt nhanh hạn dùng</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: "Hôm nay", days: 0 },
                        { label: "Ngày mai", days: 1 },
                        { label: "3 ngày", days: 3 },
                        { label: "1 tuần", days: 7 },
                        { label: "1 tháng", days: 30 }
                      ].map((sc) => (
                        <button
                          key={sc.label}
                          type="button"
                          onClick={() => handleSetExpiryDays(sc.days)}
                          className="bg-gray-100 dark:bg-gray-800 hover:bg-[var(--success)]/10 hover:text-[var(--success)] border border-transparent hover:border-[var(--success)]/30 rounded py-1 px-1.5 text-[9px] font-bold transition-all text-gray-600 dark:text-gray-400"
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[var(--success)] to-[#16A34A] text-white font-bold py-2.5 shadow-md hover-lift rounded-[var(--radius-btn)] mt-3 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào tủ lạnh
                  </Button>
                </form>

              </CardContent>
            </Card>
          )}

          {/* TAB CONTENT: AUDIT LOGS */}
          {rightTab === "logs" && (
            <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden max-h-[600px] flex flex-col">
              <CardHeader className="p-4 pb-2 border-b border-[var(--border-light)] flex-shrink-0">
                <CardTitle className="text-xs font-bold text-[var(--text-dark)] uppercase tracking-wider flex items-center justify-between">
                  <span>Lịch sử biến động</span>
                  <History className="w-4 h-4 text-[var(--success)]" />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-3 overflow-y-auto flex-grow space-y-3 scrollbar-thin">
                {logs.length === 0 ? (
                  <p className="text-center py-10 text-[10px] text-[var(--text-muted)] font-semibold">
                    Chưa ghi nhận biến động kho nào
                  </p>
                ) : (
                  logs.map((log: any) => {
                    const date = new Date(log.NgayThucHien).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    }) + " " + new Date(log.NgayThucHien).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit"
                    });

                    // Styles based on actions
                    const actionStyles: Record<string, { badge: string; border: string }> = {
                      "THEM_MOI": { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-l-emerald-500" },
                      "CAP_NHAT": { badge: "bg-blue-50 text-blue-700 border-blue-200", border: "border-l-blue-500" },
                      "TIEU_THU": { badge: "bg-orange-50 text-orange-700 border-orange-200", border: "border-l-orange-500" },
                      "XOA": { badge: "bg-red-50 text-red-700 border-red-200", border: "border-l-red-500" }
                    };

                    const style = actionStyles[log.HanhDong] || { badge: "bg-gray-50 text-gray-700 border-gray-200", border: "border-l-gray-400" };

                    return (
                      <div
                        key={log.MaNhatKy}
                        className={`bg-gray-50 border-l-4 ${style.border} rounded-r-lg p-2.5 text-[10px] space-y-1 hover:shadow-sm transition-all`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[var(--text-dark)]">{log.TenTP}</span>
                          <span className="text-[8px] text-[var(--text-muted)] font-bold font-mono">{date}</span>
                        </div>

                        {/* Action details */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className={`text-[8px] font-black tracking-wider py-0 px-1 border border-transparent rounded ${style.badge}`}>
                            {log.HanhDong === "THEM_MOI" ? "THÊM MỚI" : log.HanhDong === "CAP_NHAT" ? "SỬA" : log.HanhDong === "TIEU_THU" ? "SỬ DỤNG" : "ĐÃ XÓA"}
                          </Badge>
                          {log.SoLuongTruoc !== null && log.SoLuongSau !== null && (
                            <span className="font-semibold text-gray-500">
                              ({log.SoLuongTruoc} → {log.SoLuongSau} {log.DonVi})
                            </span>
                          )}
                        </div>

                        <p className="text-gray-500 leading-relaxed font-semibold italic">{log.GhiChu}</p>
                        
                        <div className="flex items-center gap-1 text-[8px] text-[var(--text-muted)] font-bold pt-1 border-t border-gray-200/50">
                          <User className="w-2.5 h-2.5 text-gray-400" />
                          <span>Bởi: {log.TenNguoiThucHien || "Hệ thống"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          )}

        </div>

      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      <AddInventoryItemModal isOpen={showAddItem} onClose={() => setShowAddItem(false)} onSubmit={handleAddSubmit} />
      <FilterModal isOpen={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} type="inventory" />
      
      {viewItem && (
        <ViewInventoryDetailsModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          item={viewItem}
          onEdit={(item: any) => { setViewItem(null); }}
          onUse={(item: any) => { setViewItem(null); setUseItemModal(item); }}
        />
      )}
      
      {useItemModal && (
        <UseInventoryModal 
          isOpen={!!useItemModal} 
          onClose={() => setUseItemModal(null)} 
          onSubmit={handleUseItemSubmit} 
          item={useItemModal} 
        />
      )}
      
      <ConfirmDialog
        isOpen={!!deleteItemModal}
        onClose={() => setDeleteItemModal(null)}
        onConfirm={handleDeleteItem}
        title="Xóa thực phẩm?"
        message={`Bạn có chắc muốn xóa "${deleteItemModal?.name}" khỏi kho không? Hành động này sẽ được ghi vào nhật ký gia đình.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

    </div>
  );
}