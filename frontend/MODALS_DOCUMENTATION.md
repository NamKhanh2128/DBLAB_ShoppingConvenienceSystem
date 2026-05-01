# 🎨 Tài liệu Modal Components - Hệ thống Quản lý Đi Chợ

## 📋 Tổng quan
Hệ thống bao gồm **25+ modal components** đầy đủ chức năng cho toàn bộ ứng dụng, từ Dashboard đến Shopping List, Inventory, Meal Plan, Recipes, Reports và Family Members.

---

## 🛒 Shopping List Modals

### 1. AddShoppingListModal
**Mục đích:** Tạo danh sách mua sắm mới  
**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onSubmit: (data) => void`

**Features:**
- Chọn tên danh sách
- Chọn ngày mua sắm
- Chọn biểu tượng emoji (8 options)
- Thêm ghi chú

---

### 2. AddShoppingItemModal
**Mục đích:** Thêm món mới vào danh sách  
**File:** `/src/app/components/common/AddShoppingItemModal.tsx`

---

### 3. EditShoppingItemModal
**Mục đích:** Chỉnh sửa thông tin món trong danh sách  
**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onSubmit: (data) => void`
- `item?: any`

**Features:**
- Sửa tên món
- Cập nhật số lượng và giá
- Chọn emoji (12 options)
- Chọn danh mục
- Phân công người phụ trách

---

### 4. ViewShoppingItemModal
**Mục đích:** Xem chi tiết món mua  
**Features:**
- Hiển thị trạng thái (đã mua/chưa mua)
- Thông tin số lượng, giá, danh mục
- Người phụ trách
- Nút đánh dấu đã mua/chưa mua

---

### 5. ShareShoppingListModal
**Mục đích:** Chia sẻ danh sách mua sắm  
**Features:**
- Copy link chia sẻ
- Chia sẻ qua Email
- Chia sẻ qua SMS
- QR Code placeholder

---

## 📦 Inventory Modals

### 6. AddInventoryItemModal
**Mục đích:** Thêm thực phẩm vào kho  
**Features:**
- Nhập tên thực phẩm
- Số lượng và đơn vị (7 options)
- Vị trí lưu trữ (4 locations)
- Danh mục (7 categories)
- Ngày hết hạn
- Ghi chú

---

### 7. ViewInventoryDetailsModal
**Mục đích:** Xem chi tiết thực phẩm trong kho  
**Features:**
- Header với gradient và status badge
- Thông tin số lượng, vị trí, hạn sử dụng
- Lịch sử lưu trữ
- Nút Chỉnh sửa và Sử dụng

---

### 8. UseInventoryModal
**Mục đích:** Đánh dấu sử dụng thực phẩm  
**Features:**
- Hiển thị số lượng hiện có
- Selector số lượng sử dụng với +/- buttons
- Tính toán số lượng còn lại
- Ghi chú mục đích sử dụng

---

### 9. TransferInventoryModal
**Mục đích:** Chuyển thực phẩm sang vị trí khác  
**Features:**
- Hiển thị vị trí hiện tại
- Chọn vị trí mới (4 options với icons)
- Arrow indicator
- Lưu ý về lịch sử

---

## 🍽️ Meal Plan Modals

### 10. AddMealPlanModal
**Mục đích:** Thêm kế hoạch ăn uống  
**Features:**
- Chọn ngày ăn
- Chọn bữa (4 meal types)
- Chọn món ăn từ recipes
- Số người ăn
- Thời gian nấu
- Ghi chú

---

### 11. GenerateMealPlanModal
**Mục đích:** AI tự động tạo kế hoạch ăn  
**Features:**
- Chọn khoảng thời gian (from-to date)
- Nhập số người ăn
- Chọn bữa ăn trong ngày (4 options)
- Chọn sở thích ăn uống (4 dietary preferences)
- AI suggestion info

---

## 👨‍🍳 Recipe Modals

### 12. AddRecipeModal
**Mục đích:** Tạo công thức nấu ăn mới  
**Features:**
- Thông tin cơ bản (tên, mô tả)
- Loại món (6 cuisine types)
- Độ khó (3 levels)
- Thời gian và số người
- Quản lý nguyên liệu (dynamic add/remove)
- Quản lý các bước thực hiện (dynamic steps)

---

### 13. ViewRecipeModal
**Mục đích:** Xem chi tiết công thức  
**Features:**
- Header với rating và badges
- Quick info (thời gian, số người)
- Mô tả
- Danh sách nguyên liệu
- Các bước thực hiện (numbered)
- Actions: Yêu thích, Chia sẻ, In
- Nút thêm vào kế hoạch

---

### 14. ImportRecipeModal
**Mục đích:** Import công thức từ bên ngoài  
**Features:**
- Tabs: From URL / From File
- Import từ URL với loading state
- Danh sách trang được hỗ trợ
- Drag & drop file zone
- Hỗ trợ PDF, JSON, TXT

---

## 📊 Report Modals

### 15. ExportReportModal
**Mục đích:** Xuất báo cáo  
**Features:**
- Chọn loại báo cáo (5 types)
- Chọn định dạng (PDF, Excel, CSV)
- Khoảng thời gian (from-to date)
- Checkboxes cho nội dung:
  - Biểu đồ và đồ thị
  - Tổng quan thống kê
  - Chi tiết giao dịch

---

## 👥 Family Members Modals

### 16. InviteMemberModal
**File:** `/src/app/components/common/InviteMemberModal.tsx`  
**Mục đích:** Mời thành viên mới

---

### 17. EditMemberModal
**Mục đích:** Chỉnh sửa thông tin thành viên  
**Features:**
- Avatar preview
- Tên, email, số điện thoại
- Chọn vai trò (3 roles với colors)
- Mô tả vai trò

---

### 18. ViewMemberDetailsModal
**Mục đích:** Xem chi tiết thành viên  
**Features:**
- Avatar và role badge
- Thông tin liên hệ (email, phone, join date)
- Hoạt động gần đây (3 activities)
- Statistics (danh sách, món ăn, công thức)
- Nút Chỉnh sửa và Quản lý quyền

---

### 19. ManagePermissionsModal
**Mục đích:** Quản lý quyền hạn chi tiết  
**Features:**
- 6 permission groups:
  - Danh sách mua sắm (4 permissions)
  - Kho thực phẩm (4 permissions)
  - Kế hoạch ăn uống (4 permissions)
  - Công thức nấu ăn (4 permissions)
  - Báo cáo (2 permissions)
  - Quản lý thành viên (4 permissions)
- Toggle switches cho mỗi quyền
- Summary tổng số quyền được cấp

---

## 📱 Dashboard Modals

### 20. QuickActionModal
**Mục đích:** Hành động nhanh từ dashboard  
**Features:**
- Grid 2x3 với 6 quick actions:
  - Thêm danh sách mua sắm
  - Thêm thực phẩm vào kho
  - Lên kế hoạch ăn uống
  - Tạo công thức nấu ăn
  - Xem báo cáo
  - Mời thành viên
- Hover effects với gradient backgrounds
- Icons và descriptions

---

### 21. ViewStatDetailsModal
**Mục đích:** Xem chi tiết thống kê  
**Features:**
- Header với main value và change badge
- Phân bổ theo tuần (4 weeks với progress bars)
- Phân loại chi tiêu (4 categories với gradient)
- Summary box
- Nút xuất báo cáo

---

## 🔧 Common Modals

### 22. FilterModal
**Mục đích:** Bộ lọc cho các danh sách  
**Props:**
- `type?: "shopping" | "inventory" | "meal" | "recipe"`

**Features:**
- Khoảng thời gian
- Danh mục
- Trạng thái (cho shopping)
- Vị trí lưu trữ (cho inventory)
- Khoảng giá (cho shopping)
- Người phụ trách (cho shopping)
- Tình trạng hạn sử dụng (cho inventory)
- Nút Đặt lại và Áp dụng

---

### 23. Modal (Base Component)
**File:** `/src/app/components/common/Modal.tsx`  
**Mục đích:** Base modal component  
**Features:**
- Backdrop với animation
- Portal rendering
- Click outside to close
- ESC key handler

---

### 24. ConfirmDialog
**File:** `/src/app/components/common/ConfirmDialog.tsx`

---

### 25. ViewDetailsModal
**File:** `/src/app/components/common/ViewDetailsModal.tsx`

---

## 🎨 Design System

Tất cả modal đều tuân theo **NATEAT Design System**:

### Colors
- **Purple Gradient:** `from-[var(--purple)] to-[var(--purple-dark)]`
- **Gold Gradient:** `from-[var(--gold)] to-[#D4941C]`
- **Green Gradient:** `from-[#22C55E] to-[#16A34A]`

### Border Radius
- **Large:** `var(--radius-lg)` (28px)
- **Medium:** `var(--radius)` (22px)
- **Small:** `var(--radius-sm)` (12px)
- **Button:** `var(--radius-btn)` (22px)

### Shadows
- **Card:** `var(--shadow-card)`
- **Button:** `var(--shadow-btn)`

### Animations
- **Slide Up:** `animate-slide-up`
- **Hover Lift:** `hover-lift`
- **Transition:** `transition-smooth`

---

## 📝 Usage Example

```tsx
import { AddShoppingListModal } from "@/app/components/common";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: any) => {
    console.log("New shopping list:", data);
    // Handle the data
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Tạo danh sách mới
      </button>

      <AddShoppingListModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
```

---

## 🚀 Features Chung

Tất cả modal đều có:
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Vietnamese language
- ✅ Consistent UI/UX
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling ready
- ✅ Accessibility support
- ✅ Mobile friendly

---

## 📦 File Structure

```
/src/app/components/common/
├── Modal.tsx (Base)
├── ConfirmDialog.tsx
├── EmptyState.tsx
├── LoadingSpinner.tsx
├── PageHeader.tsx
├── StatCard.tsx
├── Toast.tsx
├── GlobalToastContainer.tsx
│
├── AddShoppingListModal.tsx
├── AddShoppingItemModal.tsx
├── EditShoppingItemModal.tsx
├── ViewShoppingItemModal.tsx
├── ShareShoppingListModal.tsx
│
├── AddInventoryItemModal.tsx
├── ViewInventoryDetailsModal.tsx
├── UseInventoryModal.tsx
├── TransferInventoryModal.tsx
│
├── AddMealPlanModal.tsx
├── GenerateMealPlanModal.tsx
│
├── AddRecipeModal.tsx
├── ViewRecipeModal.tsx
├── ImportRecipeModal.tsx
│
├── ExportReportModal.tsx
│
├── InviteMemberModal.tsx
├── EditMemberModal.tsx
├── ViewMemberDetailsModal.tsx
├── ManagePermissionsModal.tsx
│
├── QuickActionModal.tsx
├── ViewStatDetailsModal.tsx
│
├── FilterModal.tsx
└── index.ts (Exports)
```

---

## 🎯 Next Steps

Để sử dụng các modal này trong pages:

1. Import modal từ `@/app/components/common`
2. Tạo state `isOpen` và `setIsOpen`
3. Tạo handler function cho `onSubmit`/`onAction`
4. Render modal với props tương ứng

---

**Tạo bởi:** AI Assistant  
**Ngày:** 16/04/2026  
**Version:** 1.0.0
