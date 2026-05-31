# Danh sách lỗi phát hiện được - Shopping Convenience System

> Ghi chú: Chạy local, bỏ qua các lỗi bảo mật không quan trọng ở môi trường dev.

---

## MODULE 1 — DASHBOARD

### LỖI 1.1 — Số liệu thống kê cuối trang bị hardcode (Logic)
**File:** `frontend/src/app/pages/Dashboard/Dashboard.tsx` — dòng 600–626  
**Mô tả:** 4 thẻ thống kê ở cuối trang ("Công thức mới", "Thành viên", "Hoàn thành", "Streak") đều là số cứng hardcode (24, 5, 87%, 12), không lấy từ API. Dữ liệu luôn hiển thị sai bất kể thực tế.  
**Hậu quả:** Người dùng thấy số liệu sai, không phản ánh thực tế.

### LỖI 1.2 — Thêm bữa ăn từ Dashboard dùng maMon hardcode = 1 (Logic)
**File:** `frontend/src/app/pages/Dashboard/Dashboard.tsx` — dòng 153  
**Mô tả:** Hàm `handleAddMeal` luôn truyền `maMon: 1` thay vì dùng recipeId từ modal. Dù người dùng chọn món nào, bữa ăn vẫn được tạo với món ăn có ID = 1.  
```javascript
maMon: 1,  // hardcoded — nên dùng data.recipeId
```
**Hậu quả:** Thêm bữa ăn từ Dashboard luôn tạo sai món ăn.

### LỖI 1.3 — Thêm bữa ăn từ Dashboard bỏ qua trường ngày trong modal (Logic)
**File:** `frontend/src/app/pages/Dashboard/Dashboard.tsx` — dòng 152  
**Mô tả:** `handleAddMeal` ghi đè ngày bằng `new Date().toISOString().split('T')[0]` (hôm nay), bỏ qua `data.date` mà người dùng đã chọn trong AddMealPlanModal.  
**Hậu quả:** Không thể lên kế hoạch ăn cho ngày tương lai từ Dashboard.

---

## MODULE 2 — SHOPPING LIST

### LỖI 2.1 — Tính toán chi tiêu đã mua bị lỗi operator precedence (Logic)
**File:** `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` — dòng 168  
**Mô tả:** Biểu thức tính giá thực tế bị sai thứ tự ưu tiên toán tử:
```javascript
// Sai:
const purchasedCost = items.filter(i => i.done).reduce((s, i) => s + i.actualPrice || i.price, 0);
// Biểu thức được evaluate thành: (s + i.actualPrice) || i.price
// Đúng:
const purchasedCost = items.filter(i => i.done).reduce((s, i) => s + (i.actualPrice || i.price), 0);
```
**Hậu quả:** Khi `s + i.actualPrice === 0`, fallback về `i.price` nhưng `s` đã cộng nhầm, dẫn đến tổng tiền đã mua hiển thị sai.

### LỖI 2.2 — Nút "Xuất PDF" là fake, không tạo file thật (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` — dòng 263–266  
**Mô tả:** Hàm `handleExportPDF` chỉ hiển thị toast giả mạo sau 1.5 giây, không thực sự tạo hay tải file PDF nào.
```javascript
const handleExportPDF = () => {
  info("📄 Xuất PDF", "Đang tạo file PDF...");
  setTimeout(() => success("✅ Xuất PDF thành công!", "File đã được tải xuống."), 1500);
};
```
**Hậu quả:** Người dùng không bao giờ nhận được file PDF.

### LỗI 2.3 — Nút "Chia sẻ" là fake, không gửi dữ liệu thật (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` — dòng 259–261  
**Mô tả:** `handleShare` chỉ hiển thị toast thành công mà không gọi API hay chia sẻ gì thực sự.  
**Hậu quả:** Tính năng chia sẻ danh sách hoàn toàn không hoạt động.

### LỖI 2.4 — useEffect thiếu dependency loadItems (React Hook)
**File:** `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` — dòng 150–153  
**Mô tả:** `loadItems` không có trong dependency array của `useEffect`:
```javascript
useEffect(() => {
  if (!selectedListId) return;
  loadItems(selectedListId).then(data => setRawItems(data));
}, [selectedListId]); // ⚠️ thiếu loadItems
```
**Hậu quả:** Có thể gây stale closure, ESLint warning, và hành vi không nhất quán.

---

## MODULE 3 — INVENTORY (KHO THỰC PHẨM)

### LỖI 3.1 — Modal "Thêm thủ công" không dùng dữ liệu từ form trong modal (Logic nghiêm trọng)
**File:** `frontend/src/app/pages/Inventory/Inventory.tsx` — dòng 808  
**Mô tả:** Button "Thêm thủ công" mở `AddInventoryItemModal` với `onSubmit={handleAddSubmit}`. Nhưng `handleAddSubmit` đọc từ local state `formName`, `formQty`, `formUnit`... của component — là state của form "Thêm Nhanh" bên phải, không phải từ modal. Dữ liệu người dùng nhập trong modal bị bỏ qua hoàn toàn.  
**Hậu quả:** Form modal "Thêm thủ công" không thêm được hàng, hoặc submit dữ liệu sai (từ form Thêm Nhanh).

### LỖI 3.2 — Không có nút "Xem chi tiết" (Eye) trên card thực phẩm (UI)
**File:** `frontend/src/app/pages/Inventory/Inventory.tsx` — dòng 483–524  
**Mô tả:** `viewItem` state và `ViewInventoryDetailsModal` được khai báo đầy đủ, nhưng không có button nào trong card thực phẩm gọi `setViewItem(item)`. Người dùng không thể mở modal xem chi tiết từ danh sách thực phẩm.  
**Hậu quả:** Tính năng xem chi tiết tồn tại trong code nhưng không thể trigger từ UI.

### LỖI 3.3 — Form "Thêm Nhanh" không gửi trường Category và Notes lên API (Logic)
**File:** `frontend/src/app/pages/Inventory/Inventory.tsx` — dòng 178–184  
**Mô tả:** `handleAddSubmit` khai báo state `formCategory` và `formNotes`, nhưng không gửi chúng trong lời gọi `addItem`:
```javascript
await addItem({
  tenTP: formName,
  soLuong: qty,
  donVi: formUnit,
  hanSuDung: formExpiry || null,
  viTri: formLocation,
  // formCategory không được gửi
  // formNotes không được gửi
});
```
**Hậu quả:** Danh mục và ghi chú luôn bị bỏ qua khi thêm nhanh.

### LỖI 3.4 — Button text "Thêm vào tủ lạnh" sai với các vị trí khác (UI)
**File:** `frontend/src/app/pages/Inventory/Inventory.tsx` — dòng 724  
**Mô tả:** Nút submit của form Quick Add hiển thị "Thêm vào tủ lạnh" nhưng người dùng có thể chọn vị trí khác như Ngăn đông, Tủ bếp, Kệ đồ.  
**Hậu quả:** Label nút gây nhầm lẫn.

### LỖI 3.5 — Quick decrement trên group item luôn trừ batch đầu tiên (Logic)
**File:** `frontend/src/app/pages/Inventory/Inventory.tsx` — dòng 488  
**Mô tả:** Khi nhấn "-1" trên item dạng nhóm (gộp), luôn trừ `item.batches[0]` dù batch đó có thể đã hết (`quantity === 0`).  
**Hậu quả:** Giảm số lượng batch đã hết thay vì batch còn hàng.

---

## MODULE 4 — MEAL PLAN

### LỖI 4.1 — Loại bữa "Phụ" không được ánh xạ trong buoiMap (Logic)
**File:** `frontend/src/app/pages/MealPlan/MealPlan.tsx` — dòng 19  
**Mô tả:** `AddMealPlanModal` cung cấp 4 loại bữa: Sáng, Trưa, Tối, **Phụ**. Nhưng `buoiMap` trong MealPlan.tsx chỉ có 3 key:
```javascript
const buoiMap: Record<string, string> = { "Sáng": "SANG", "Trưa": "TRUA", "Tối": "TOI" };
// Không có "Phụ" → "PHU"
```
Khi user chọn "Phụ", `buoiMap["Phụ"]` trả về `undefined`, fallback về `'TOI'`.  
**Hậu quả:** Bữa phụ bị lưu thành bữa Tối.

### LỖI 4.2 — Nút "Tạo tự động" không gọi API, chỉ reload dữ liệu (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/MealPlan/MealPlan.tsx` — dòng 232–236  
**Mô tả:** `handleGenerate` nhận `_data` (tham số với dấu _ = bị bỏ qua), không gọi API tạo tự động nào, chỉ reload meal plans hiện có và hiện toast thành công.
```javascript
const handleGenerate = async (_data: any) => {
  await fetchMealPlans(); // chỉ reload, không tạo gì mới
  success('🤖 Tạo tự động thành công!', '...');
};
```
**Hậu quả:** Nút "Tạo tự động" hoàn toàn không làm gì mới, người dùng bị lừa.

---

## MODULE 5 — RECIPES (CÔNG THỨC)

### LỖI 5.1 — Xóa công thức không có dialog xác nhận (UX/Logic)
**File:** `frontend/src/app/pages/Recipes/Recipes.tsx` — dòng 544–553  
**Mô tả:** `handleDeleteRecipe` gọi trực tiếp `deleteRecipe(recipe.id)` khi người dùng click icon thùng rác, không có bước xác nhận. Khi hover vào card, icon Trash hiện ra và click ngay lập tức xóa.  
**Hậu quả:** Dễ xóa nhầm công thức vĩnh viễn chỉ bằng 1 click.

### LỖI 5.2 — CookingModal có nguy cơ infinite loop khi recipe không có bước nào (Logic)
**File:** `frontend/src/app/pages/Recipes/Recipes.tsx` — dòng 86–88, 106–118  
**Mô tả:** Khi `recipe.steps.length === 0`, biến `steps` được khai báo inline:
```javascript
const steps = recipe.steps.length > 0
  ? recipe.steps
  : ["Không có hướng dẫn nấu ăn cho công thức này."];
```
`steps` là array mới mỗi render. useEffect phụ thuộc vào `steps`:
```javascript
useEffect(() => {
  const timeInSecs = detectTimeInStep(steps[step]);
  ...
}, [step, steps]); // steps là reference mới mỗi render
```
→ Mỗi render tạo `steps` mới → effect chạy → `setSecondsLeft(0)` → re-render → loop.  
**Hậu quả:** Nguy cơ vòng lặp vô tận khi mở CookingModal cho công thức không có hướng dẫn.

### LỖI 5.3 — AddMealPlanModal gọi recipesApi.getAll() không có groupId (Logic)
**File:** `frontend/src/app/components/common/AddMealPlanModal.tsx` — dòng 51  
**Mô tả:** Khi mở modal thêm bữa ăn:
```javascript
recipesApi.getAll()  // Không truyền groupId!
```
Không có groupId → chỉ lấy system recipes (công thức hệ thống), bỏ qua công thức riêng tư của gia đình.  
**Hậu quả:** Công thức do gia đình tạo không xuất hiện trong dropdown chọn món khi lên kế hoạch bữa ăn.

### LỖI 5.4 — Tính năng "Thêm vào kế hoạch ăn" từ Recipes sai kiểu dữ liệu soKhauPhan (Logic)
**File:** `frontend/src/app/pages/Recipes/Recipes.tsx` — dòng 566–576  
**Mô tả:** `handleMealPlanSubmit` gọi `addMeal` nhưng không gửi `soKhauPhan` (số khẩu phần):
```javascript
await addMeal({
  ngay: data.date || new Date().toISOString().split("T")[0],
  buoi: data.mealType === "Sáng" ? "SANG" : ...,
  maMon: addToPlanRecipe?.id || 1,
  tenMon: addToPlanRecipe?.name || data.recipeName,
  // thiếu soKhauPhan!
  ghiChu: data.notes || "",
});
```
**Hậu quả:** Số khẩu phần mặc định không được gửi, bữa ăn được tạo thiếu thông tin.

---

## MODULE 6 — REPORTS (BÁO CÁO)

### LỖI 6.1 — Số tiền "Tiết kiệm nhờ tối ưu kho" là fake calculation (Logic)
**File:** `frontend/src/app/pages/Reports/Reports.tsx` — dòng 80  
**Mô tả:** Giá trị tiết kiệm luôn bằng đúng 15% tổng chi tiêu, không dựa trên dữ liệu thực:
```javascript
const savings = Math.max(0, totalSpend * 0.15); // Hardcode 15%
```
**Hậu quả:** Người dùng thấy số tiết kiệm ảo, không có ý nghĩa thực tế.

### LỖI 6.2 — res.message không tồn tại trong return type của addMissingToShopping (TypeScript/Runtime)
**File:** `frontend/src/app/pages/MealPlan/MealPlan.tsx` — dòng 199  
**Mô tả:** API `addMissingToShopping` được khai báo trả về `{ success: boolean; data: { success: boolean; listId: number } }` nhưng code dùng `res.message`:
```javascript
success("🛒 Mua sắm siêu tốc thành công!", res.message); // res.message undefined!
```
**Hậu quả:** Toast thành công hiển thị `undefined` thay vì nội dung thông báo.

---

## MODULE 7 — FAMILY MEMBERS (THÀNH VIÊN GIA ĐÌNH)

### LỖI 7.1 — "Sửa thành viên" không gọi API, chỉ hiện toast giả (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/FamilyMembers/FamilyMembers.tsx` — dòng 154–158  
**Mô tả:** `handleEdit` nhận `_data` (bỏ qua), không gọi API nào để lưu thay đổi:
```javascript
const handleEdit = (_data: any) => {
  success("✅ Cập nhật thành công!", `Thông tin đã được cập nhật.`);
  setEditMember(null);
  fetchMembers();
};
```
**Hậu quả:** Chỉnh sửa thông tin thành viên hoàn toàn không lưu được gì.

### LỖI 7.2 — "Quản lý quyền" không gọi API, chỉ hiện toast giả (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/FamilyMembers/FamilyMembers.tsx` — dòng 204–207  
**Mô tả:** `handleManagePermissions` bỏ qua `_data` và không gọi API nào:
```javascript
const handleManagePermissions = (_data: any) => {
  success("✅ Cập nhật quyền thành công!", `Quyền của ${managePerm?.name} đã được cập nhật.`);
  setManagePerm(null);
};
```
**Hậu quả:** Thay đổi quyền thành viên không được lưu.

---

## MODULE 8 — SETTINGS (CÀI ĐẶT)

### LỖI 8.1 — Cài đặt thông báo chỉ lưu local state, không persist (Logic)
**File:** `frontend/src/app/pages/Settings/Settings.tsx` — dòng 124–136  
**Mô tả:** Toggle thông báo (expiryAlert, shoppingReminder...) chỉ cập nhật React state cục bộ, không gọi API để lưu vào DB. Khi F5 trang, tất cả cài đặt reset về giá trị mặc định.  
**Hậu quả:** Cài đặt thông báo không được lưu giữa các phiên.

### LỖI 8.2 — Đổi ngôn ngữ không thực sự thay đổi giao diện (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/Settings/Settings.tsx` — dòng 138–142  
**Mô tả:** Tất cả text trong app đều hardcode tiếng Việt. Khi chọn "English" và lưu, không có gì thay đổi vì không có hệ thống i18n thực sự.  
**Hậu quả:** Nút "Lưu cài đặt" ngôn ngữ không làm gì.

### LỖI 8.3 — Xóa tài khoản chỉ hiện warning, không có chức năng thật (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/Settings/Settings.tsx` — dòng 144–146  
**Mô tả:** Nút xóa tài khoản chỉ hiện toast cảnh báo.  
**Hậu quả:** Không thể xóa tài khoản.

### LỖI 8.4 — Upload ảnh đại diện không hoạt động (Chức năng không hoạt động)
**File:** `frontend/src/app/pages/Settings/Settings.tsx` — dòng 179–181  
**Mô tả:** Nút camera chỉ hiện toast "Tính năng đang phát triển", không mở file picker.

---

## MODULE 9 — AUTH / NAVIGATION

### LỖI 9.1 — Redirect sau khi token hết hạn dẫn đến đường dẫn sai (Routing)
**File:** `frontend/src/app/services/api.ts` — dòng 79  
**Mô tả:** Khi refresh token thất bại, code redirect đến `/login`:
```javascript
window.location.href = '/login?expired=true';
```
Nhưng trong `routes.tsx`, trang login nằm ở `/auth/login`, không phải `/login`. Route `/login` không tồn tại.  
**Hậu quả:** Khi phiên hết hạn, người dùng bị điều hướng đến trang 404 thay vì trang đăng nhập.

### LỖI 9.2 — Dashboard có 2 route trùng nhau (/app và /app/dashboard) (Routing)
**File:** `frontend/src/app/routes.tsx` — dòng 51–52  
**Mô tả:** Dashboard được mount ở cả `/app` (index route) và `/app/dashboard`. Khi ở `/app`, sidebar active state có thể không highlight đúng menu Dashboard.

### LỖI 9.3 — Dashboard bữa ăn hôm nay navigate với timeout có thể xếp chồng (UX)
**File:** `frontend/src/app/pages/Dashboard/Dashboard.tsx` — dòng 501–504  
**Mô tả:** Mỗi click vào bữa ăn trong dashboard tạo một `setTimeout` 600ms để navigate. Click nhiều lần → nhiều navigate() xếp chồng.

---

## MODULE 10 — BACKEND

### LỖI 10.1 — Ngưỡng "sắp hết hạn" hardcode 3 ngày (Logic Backend)
**File:** `backend/src/modules/inventory/inventory.service.ts` — dòng 29  
**Mô tả:** `getExpiring` luôn dùng ngưỡng 3 ngày cố định:
```typescript
return this.repo.getExpiring(groupId, 3);
```
Không thể tùy chỉnh, không nhất quán với UI mà header nói "Sắp/Đã hết hạn" (ngụ ý bao gồm cả hết hạn rồi).

### LỖI 10.2 — endpoint getLogs dùng path param thay vì query param (Inconsistency API)
**File:** `frontend/src/app/services/api.ts` — dòng 230  
**Mô tả:** Trong khi các endpoint inventory khác dùng `?groupId=`, getLogs dùng path param:
```javascript
getLogs: (groupId: number) => request(`/inventory/${groupId}/logs`)
// Nhưng các endpoint khác: /inventory?groupId=${groupId}
```
Không nhất quán trong thiết kế API.

### LỖI 10.3 — AuthContext.tsx - kiểm tra checkRes.ok thừa (Code Quality)
**File:** `frontend/src/app/context/AuthContext.tsx` — dòng 82  
**Mô tả:** `checkRes.ok` đã được kiểm tra ở if block bên ngoài (dòng 81), nhưng được kiểm tra lại lần nữa một cách dư thừa:
```javascript
if (checkRes.ok) {
  const refreshData = await checkRes.ok ? await checkRes.json() : null;
  // checkRes.ok luôn true ở đây → `await checkRes.ok` là `await true`
```

---

## TỔNG KẾT

| Loại lỗi | Số lượng |
|---|---|
| Logic sai / tính toán sai | 10 |
| Chức năng fake / không hoạt động | 8 |
| UI/Button sai hoặc thiếu | 4 |
| Popup/Modal lỗi | 4 |
| Routing / Navigation | 3 |
| Code quality / TypeScript | 3 |
| **Tổng** | **32** |

### Ưu tiên sửa (Critical)
1. **LỖI 3.1** — Modal "Thêm thủ công" kho không dùng dữ liệu modal
2. **LỖI 9.1** — Redirect hết hạn token dẫn đến 404
3. **LỖI 1.2 + 1.3** — Thêm bữa ăn từ Dashboard hardcode sai
4. **LỖI 4.1** — Loại bữa "Phụ" bị map sai thành "Tối"
5. **LỖI 2.1** — Operator precedence tính chi tiêu sai
6. **LỖI 5.3** — Dropdown công thức không hiện recipe riêng của gia đình
7. **LỖI 7.1 + 7.2** — Sửa thành viên và quản lý quyền không gọi API
