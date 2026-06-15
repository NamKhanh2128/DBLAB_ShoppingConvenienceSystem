# BÁO CÁO THỐNG KÊ LỖI VÀ ĐIỂM YẾU HỆ THỐNG
**Dự án:** Shopping Convenience System (Hệ thống hỗ trợ đi chợ và quản lý thực phẩm gia đình)  
**Ngày thực hiện:** 04/06/2026  
**Trạng thái kiểm tra:** Hoàn thành (Frontend & Backend tự động build thành công, không có lỗi cú pháp nhưng tồn tại nhiều lỗi logic và tính năng giả)  

---

## MỤC LỤC
1. [Tóm Tắt Thống Kê](#1-tóm-tắt-thống-kê)
2. [Phần 1: Chi Tiết 32 Lỗi Thực Tế Trong Codebase (Phát Hiện Qua Kiểm Tra Mã Nguồn)](#2-phần-1-chi-tiết-32-lỗi-thực-tế-trong-codebase)
3. [Phần 2: Điểm Yếu Kiến Trúc, Lỗi Logic Nghiệp Vụ, Edge Cases & Rủi Ro Bảo Mật](#3-phần-2-điểm-yếu-kiến-trúc-lỗi-logic-nghiệp-vụ-edge-cases--rủi-ro-bảo-mật)
4. [Lộ Trình Khắc Phục Khuyến Nghị (Prioritized Action Plan)](#4-lộ-trình-khắc-phục-khuyến-nghị)

---

## 1. TÓM TẮT THỐNG KÊ

### Phân bố lỗi codebase theo module:
*   **Module 1 — Dashboard:** 3 lỗi (Số liệu cứng, add meal sai món, bỏ qua ngày)
*   **Module 2 — Shopping List:** 4 lỗi (Operator precedence, nút fake PDF/Share, thiếu dependency)
*   **Module 3 — Inventory (Kho):** 5 lỗi (Modal thêm thủ công sai form, thiếu nút View, Quick Add thiếu Category/Notes, label button sai, quick decrement sai batch)
*   **Module 4 — Meal Plan:** 2 lỗi (Thiếu bữa phụ, nút tạo tự động fake)
*   **Module 5 — Recipes (Công thức):** 4 lỗi (Xóa thiếu confirm, infinite loop CookingModal, AddMealPlanModal thiếu groupId, add meal plan từ Recipes thiếu khẩu phần)
*   **Module 6 — Reports:** 2 lỗi (Fake calculation, res.message undefined)
*   **Module 7 — Family Members:** 2 lỗi (Sửa thành viên và quản lý quyền fake API)
*   **Module 8 — Settings:** 4 lỗi (Notification chỉ lưu local, đổi ngôn ngữ fake, xóa tài khoản fake, upload ảnh đại diện fake)
*   **Module 9 — Auth & Navigation:** 3 lỗi (Redirect token hết hạn sai link 404, trùng route Dashboard, click meal plan xếp chồng timeout)
*   **Module 10 — Backend:** 3 lỗi (Ngưỡng hết hạn hardcode, endpoint getLogs sai chuẩn API, AuthContext checkRes.ok dư thừa)
*   **Tổng số lỗi thực tế:** **32 lỗi**

### Bảng phân loại mức độ nghiêm trọng:
| Mức độ nghiêm trọng | Số lượng | Mô tả |
| :--- | :---: | :--- |
| 🔴 **Critical (Nghiêm trọng)** | **8** | Lỗi gây hỏng luồng nghiệp vụ chính, ghi đè dữ liệu sai, hoặc gây lỗi điều hướng 404/crash giao diện. |
| 🟠 **High (Cao)** | **10** | Các chức năng quan trọng bị giả mạo (fake toast mà không gọi API), hoặc tính toán sai lệch chi tiêu thực tế. |
| 🟡 **Medium (Trung bình)** | **9** | Lỗi React Hook (nguy cơ infinite loop), thiếu dialog xác nhận xóa dữ liệu, hoặc thiếu đồng bộ thuộc tính form. |
| 🔵 **Low (Thấp)** | **5** | Các lỗi nhỏ về mặt giao diện (UI label gây nhầm lẫn), code dư thừa, hoặc route trùng lặp không ảnh hưởng lớn đến nghiệp vụ. |

---

## 2. PHẦN 1: CHI TIẾT 32 LỖI THỰC TẾ TRONG CODEBASE

### 📺 MODULE 1 — DASHBOARD
#### 🔴 LỖI 1.1 — Số liệu thống kê cuối trang bị hardcode (Mức độ: High)
*   **File:** [Dashboard.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Dashboard/Dashboard.tsx#L591-L627)
*   **Mô tả:** Bốn thẻ thống kê cuối trang ("Công thức mới", "Thành viên", "Hoàn thành", "Streak") được hiển thị bằng các số cứng (24, 5, 87%, 12), hoàn toàn không được lấy từ hooks dữ liệu `stats`, `members` hay `todayMeals`.
*   **Hậu quả:** Người dùng luôn thấy số liệu không thay đổi, gây cảm giác ứng dụng bị lỗi/không hoạt động thật.
*   **Khắc phục:** Thay thế các số hardcode bằng dữ liệu thật lấy từ API (ví dụ: `stats.newRecipesCount`, `members.length`, `stats.completionRate`...).

#### 🔴 LỖI 1.2 — Thêm bữa ăn nhanh dùng ID món ăn mặc định hardcode = 1 (Mức độ: Critical)
*   **File:** [Dashboard.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Dashboard/Dashboard.tsx#L156)
*   **Mô tả:** Hàm `handleAddMeal` khi được gọi từ modal thêm nhanh luôn truyền thuộc tính `maMon: 1` lên API.
*   **Hậu quả:** Dù người dùng chọn bất kỳ công thức hay món ăn nào trong dropdown của modal, bữa ăn được tạo vẫn sẽ luôn gán cho món ăn có ID = 1.
*   **Khắc phục:** Thay thế `maMon: 1` bằng ID món ăn được chọn từ form: `maMon: data.recipeId || data.maMon`.

#### 🔴 LỖI 1.3 — Thêm bữa ăn từ Dashboard bỏ qua ngày chọn trong modal (Mức độ: Critical)
*   **File:** [Dashboard.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Dashboard/Dashboard.tsx#L154)
*   **Mô tả:** Hàm `handleAddMeal` ghi đè trường `ngay` bằng `new Date().toISOString().split('T')[0]` (luôn là ngày hôm nay), bỏ qua trường `data.date` mà người dùng đã chọn trong giao diện modal.
*   **Hậu quả:** Không thể lập kế hoạch bữa ăn cho các ngày tiếp theo từ Dashboard, gây bất tiện lớn.
*   **Khắc phục:** Thay thế bằng: `ngay: data.date || new Date().toISOString().split('T')[0]`.

---

### 🛒 MODULE 2 — SHOPPING LIST
#### 🔴 LỖI 2.1 — Tính toán chi tiêu thực tế sai do thứ tự ưu tiên toán tử (Mức độ: Critical)
*   **File:** [ShoppingList.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/ShoppingList/ShoppingList.tsx#L168)
*   **Mô tả:** Biểu thức tính `purchasedCost` (tiền đã mua) bị sai thứ tự ưu tiên toán tử:
    ```javascript
    const purchasedCost = items.filter(i => i.done).reduce((s, i) => s + i.actualPrice || i.price, 0);
    ```
    Do toán tử cộng `+` có độ ưu tiên cao hơn toán tử logic OR `||`, biểu thức được hiểu là: `(s + i.actualPrice) || i.price`.
*   **Hậu quả:** Khi tích lũy giá tiền đã mua, nếu `s + i.actualPrice` bằng 0, nó sẽ fallback về `i.price`. Ngược lại, nếu khác 0, nó sẽ lấy kết quả cộng mà bỏ qua logic fallback `i.price` khi món đó chưa nhập `actualPrice`. Điều này dẫn đến tổng tiền hiển thị bị sai lệch lớn.
*   **Khắc phục:** Thêm dấu ngoặc đơn để ép thứ tự ưu tiên:
    ```javascript
    const purchasedCost = items.filter(i => i.done).reduce((s, i) => s + (i.actualPrice || i.price), 0);
    ```

#### 🔴 LỖI 2.2 — Chức năng "Xuất PDF" danh sách mua sắm là giả (Mức độ: High)
*   **File:** [ShoppingList.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/ShoppingList/ShoppingList.tsx#L263-L266)
*   **Mô tả:** Hàm `handleExportPDF` chỉ hiển thị thông báo toast giả mạo sau 1.5 giây mà không thực hiện bất kỳ hành động tạo file hay tải file PDF nào.
*   **Hậu quả:** Người dùng không thể tải danh sách mua sắm để lưu trữ hoặc in ra giấy.
*   **Khắc phục:** Sử dụng thư viện như `jsPDF` hoặc gọi API Backend để sinh file PDF thật và tải xuống.

#### 🔴 LỖI 2.3 — Chức năng "Chia sẻ" danh sách mua sắm là giả (Mức độ: High)
*   **File:** [ShoppingList.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/ShoppingList/ShoppingList.tsx#L259-L261)
*   **Mô tả:** Hàm `handleShare` chỉ hiện toast thông báo thành công mà không gọi API hay chia sẻ liên kết thực tế.
*   **Hậu quả:** Không thể chia sẻ danh sách mua sắm cho người khác.
*   **Khắc phục:** Viết logic chia sẻ link hoặc gửi tin nhắn thông qua API hoặc các dịch vụ tích hợp.

#### 🔴 LỖI 2.4 — Thiếu dependency `loadItems` trong useEffect (Mức độ: Medium)
*   **File:** [ShoppingList.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/ShoppingList/ShoppingList.tsx#L150-L153)
*   **Mô tả:** Mảng dependency của React Hook `useEffect` chỉ chứa `[selectedListId]` nhưng bên trong lại gọi hàm `loadItems` từ custom hook `useShopping`.
*   **Hậu quả:** Gây cảnh báo ESLint, có khả năng dẫn đến stale closure nếu hàm `loadItems` thay đổi tham chiếu.
*   **Khắc phục:** Thêm `loadItems` vào mảng dependency: `[selectedListId, loadItems]`.

---

### 🏪 MODULE 3 — INVENTORY (KHO THỰC PHẨM)
#### 🔴 LỖI 3.1 — Modal "Thêm thủ công" không sử dụng dữ liệu từ form trong modal (Mức độ: Critical)
*   **File:** [Inventory.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Inventory/Inventory.tsx#L808)
*   **Mô tả:** Button "Thêm thủ công" mở modal `AddInventoryItemModal` và gán handler `onSubmit={handleAddSubmit}`. Tuy nhiên, hàm `handleAddSubmit` lại đọc dữ liệu trực tiếp từ các state cục bộ của component cha (như `formName`, `formQty`, `formUnit`...), vốn được bind với form "Thêm Nhanh" (Quick Add) nằm ở cột bên phải giao diện chứ không bind với form trong modal.
*   **Hậu quả:** Mở modal thêm thủ công nhập liệu nhưng khi bấm submit, hệ thống lại lưu thông tin của form "Thêm Nhanh" (hoặc báo lỗi thiếu dữ liệu nếu form Thêm Nhanh đang trống).
*   **Khắc phục:** Chỉnh sửa `handleAddSubmit` để nhận dữ liệu truyền ngược từ modal:
    ```typescript
    const handleAddSubmit = async (data: any) => {
      // Dùng data.name, data.quantity, data.unit... được truyền từ form của modal
    };
    ```

#### 🔴 LỖI 3.2 — Thiếu nút mở modal xem chi tiết thực phẩm (Mức độ: Medium)
*   **File:** [Inventory.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Inventory/Inventory.tsx#L483-L524)
*   **Mô tả:** State `viewItem` và modal `ViewInventoryDetailsModal` được định nghĩa đầy đủ, nhưng trong danh sách card thực phẩm hiển thị không có bất kỳ nút nào gán sự kiện `setViewItem(item)` để mở modal.
*   **Hậu quả:** Tính năng xem chi tiết thực phẩm bị "ẩn", người dùng không thể xem được ghi chú hay thông tin chi tiết.
*   **Khắc phục:** Thêm một icon nút (ví dụ: Eye icon) trên card nguyên liệu để người dùng bấm vào xem chi tiết.

#### 🔴 LỖI 3.3 — Form "Thêm Nhanh" bỏ qua trường Danh mục (Category) và Ghi chú (Notes) (Mức độ: High)
*   **File:** [Inventory.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Inventory/Inventory.tsx#L178-L184)
*   **Mô tả:** Component định nghĩa các state `formCategory` và `formNotes` cho form Thêm Nhanh, nhưng trong hàm xử lý `handleAddSubmit` gửi lên API thì hai trường này hoàn toàn bị bỏ quên.
*   **Hậu quả:** Thực phẩm thêm nhanh luôn bị thiếu thông tin Danh mục và Ghi chú.
*   **Khắc phục:** Truyền thêm các trường `danhMuc` và `ghiChu` trong request gửi đi:
    ```typescript
    await addItem({
      tenTP: formName,
      soLuong: qty,
      donVi: formUnit,
      hanSuDung: formExpiry || null,
      viTri: formLocation,
      danhMuc: formCategory,
      ghiChu: formNotes
    });
    ```

#### 🔴 LỖI 3.4 — Giao diện nút submit form thêm nhanh ghi sai vị trí (Mức độ: Low)
*   **File:** [Inventory.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Inventory/Inventory.tsx#L724)
*   **Mô tả:** Nút submit hiển thị text cứng "Thêm vào tủ lạnh", tuy nhiên người dùng có thể chọn vị trí lưu trữ khác trong dropdown (như Ngăn đông, Tủ bếp, Kệ đồ).
*   **Hậu quả:** Gây trải nghiệm người dùng khó hiểu (chọn cất ở Tủ bếp nhưng nút bấm vẫn bảo "Thêm vào tủ lạnh").
*   **Khắc phục:** Thay đổi text nút linh hoạt theo vị trí đã chọn hoặc đổi thành "Thêm vào kho".

#### 🔴 LỖI 3.5 — Trừ nhanh số lượng ở mặt hàng gộp luôn trừ lô (batch) đầu tiên (Mức độ: High)
*   **File:** [Inventory.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Inventory/Inventory.tsx#L488)
*   **Mô tả:** Khi gộp các thực phẩm cùng tên, nút "-1" (tiêu thụ nhanh) luôn truyền `item.batches[0]` vào handler.
*   **Hậu quả:** Nếu lô đầu tiên đã có số lượng bằng 0 (ví dụ lô đã hết hạn), hệ thống vẫn cố tình trừ lô đó thay vì trừ vào các lô còn hàng phía sau.
*   **Khắc phục:** Viết logic tìm lô đầu tiên có số lượng > 0 để thực hiện trừ nhanh.

---

### 📅 MODULE 4 — MEAL PLAN
#### 🔴 LỖI 4.1 — Loại bữa "Phụ" bị ánh xạ sai thành bữa "Tối" (Mức độ: Critical)
*   **File:** [MealPlan.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/MealPlan/MealPlan.tsx#L19)
*   **Mô tả:** Modal thêm bữa ăn cho phép chọn 4 loại: Sáng, Trưa, Tối, **Phụ**. Tuy nhiên đối tượng `buoiMap` ở file cha chỉ ánh xạ 3 loại:
    ```javascript
    const buoiMap: Record<string, string> = { "Sáng": "SANG", "Trưa": "TRUA", "Tối": "TOI" };
    ```
*   **Hậu quả:** Khi chọn bữa "Phụ", `buoiMap["Phụ"]` trả về `undefined`. API backend nhận giá trị trống hoặc mặc định map về bữa "Tối". Lịch ăn bữa phụ luôn bị nhảy vào bữa tối.
*   **Khắc phục:** Thêm ánh xạ cho bữa phụ: `"Phụ": "PHU"`.

#### 🔴 LỖI 4.2 — Tính năng "Tạo thực đơn tự động" là giả (Mức độ: High)
*   **File:** [MealPlan.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/MealPlan/MealPlan.tsx#L232-L236)
*   **Mô tả:** Hàm `handleGenerate` chỉ gọi `fetchMealPlans()` để tải lại danh sách hiện có và hiện toast chúc mừng, hoàn toàn không gọi API AI hay backend để tự động lên thực đơn.
*   **Hậu quả:** Nút "Tạo tự động" hoàn toàn vô dụng, người dùng không nhận được gợi ý thực đơn mới nào.
*   **Khắc phục:** Viết logic gọi API gợi ý thực đơn tự động của backend.

---

### 🍳 MODULE 5 — RECIPES (CÔNG THỨC)
#### 🔴 LỖI 5.1 — Xóa công thức không có hộp thoại xác nhận (Mức độ: Medium)
*   **File:** [Recipes.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Recipes/Recipes.tsx#L544-L553)
*   **Mô tả:** Khi click vào biểu tượng thùng rác trên card công thức, hệ thống lập tức gọi `deleteRecipe(recipe.id)` để xóa ngay mà không hiển thị hộp thoại xác nhận.
*   **Hậu quả:** Người dùng rất dễ vô tình click nhầm xóa mất công thức nấu ăn của gia đình mà không khôi phục lại được.
*   **Khắc phục:** Sử dụng `ConfirmDialog` trước khi thực hiện xóa.

#### 🔴 LỖI 5.2 — CookingModal có nguy cơ gây vòng lặp vô tận (Infinite Loop) (Mức độ: High)
*   **File:** [Recipes.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Recipes/Recipes.tsx#L86-L88) và [L106-L118](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Recipes/Recipes.tsx#L106-L118)
*   **Mô tả:** Khi một công thức không có bước hướng dẫn, biến `steps` được gán mảng mới chứa text mặc định:
    ```javascript
    const steps = recipe.steps.length > 0 ? recipe.steps : ["Không có hướng dẫn nấu ăn cho công thức này."];
    ```
    Mảng này là tham chiếu mới ở mỗi lần render. React `useEffect` lại phụ thuộc vào `[step, steps]`.
*   **Hậu quả:** Mỗi lần render tạo một `steps` mới -> kích hoạt `useEffect` -> chạy `setSecondsLeft` -> kích hoạt re-render -> lặp vô tận, gây treo trình duyệt.
*   **Khắc phục:** Khai báo mảng mặc định ở ngoài component hoặc sử dụng `useMemo` để giữ nguyên tham chiếu mảng:
    ```javascript
    const DEFAULT_STEPS = ["Không có hướng dẫn nấu ăn cho công thức này."];
    const steps = recipe.steps.length > 0 ? recipe.steps : DEFAULT_STEPS;
    ```

#### 🔴 LỖI 5.3 — Modal thêm bữa ăn gọi API lấy danh sách công thức thiếu `groupId` (Mức độ: Critical)
*   **File:** [AddMealPlanModal.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/components/common/AddMealPlanModal.tsx#L51)
*   **Mô tả:** Khi tải danh sách công thức để hiển thị trong dropdown chọn món của bữa ăn, code gọi `recipesApi.getAll()` mà không truyền `groupId`.
*   **Hậu quả:** Hệ thống chỉ tải các công thức mặc định của hệ thống, các công thức riêng tư do các thành viên trong gia đình tự tạo ra sẽ không bao giờ xuất hiện để chọn khi lên lịch ăn.
*   **Khắc phục:** Truyền `groupId` hiện tại vào hàm gọi API: `recipesApi.getAll(groupId)`.

#### 🔴 LỖI 5.4 — Lên lịch ăn từ trang chi tiết công thức bị thiếu số khẩu phần (Mức độ: Critical)
*   **File:** [Recipes.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Recipes/Recipes.tsx#L566-L576)
*   **Mô tả:** Hàm `handleMealPlanSubmit` gọi API `addMeal` nhưng không gửi thuộc tính `soKhauPhan` (số phần ăn) từ form lên.
*   **Hậu quả:** Bữa ăn được tạo ra luôn có số khẩu phần trống hoặc bằng 0 ở database, làm sai lệch lượng nguyên liệu cần mua.
*   **Khắc phục:** Gửi thêm trường `soKhauPhan: data.servings || 1` vào payload gọi API.

---

### 📊 MODULE 6 — REPORTS
#### 🔴 LỖI 6.1 — Chỉ số "Tiết kiệm nhờ tối ưu kho" bị tính toán giả mạo (Mức độ: High)
*   **File:** [Reports.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Reports/Reports.tsx#L80)
*   **Mô tả:** Số tiền tiết kiệm hiển thị trong báo cáo luôn bằng đúng 15% tổng chi tiêu:
    ```javascript
    const savings = Math.max(0, totalSpend * 0.15); // Hardcode 15%
    ```
*   **Hậu quả:** Con số tiết kiệm này là giả mạo, không phản ánh đúng lượng thực phẩm người dùng thực sự tối ưu được trong kho.
*   **Khắc phục:** Viết logic tính toán thật dựa trên lượng thực phẩm sắp hết hạn đã được dùng thay vì bỏ phí, hoặc dựa trên việc gom nhóm trùng lặp.

#### 🔴 LỖI 6.2 — Sử dụng thuộc tính `res.message` không tồn tại trong kiểu dữ liệu (Mức độ: Medium)
*   **File:** [MealPlan.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/MealPlan/MealPlan.tsx#L199)
*   **Mô tả:** API `addMissingToShopping` trả về đối tượng `{ success: boolean; data: { success: boolean; listId: number } }`, tuy nhiên code hiển thị toast lại gọi `res.message`.
*   **Hậu quả:** Giao diện toast thành công hiển thị nội dung: "Mua sắm siêu tốc thành công! - undefined".
*   **Khắc phục:** Đổi thành thông báo cố định hoặc sửa kiểu dữ liệu trả về từ API để có trường `message`.

---

### 👨‍👩‍👧‍👦 MODULE 7 — FAMILY MEMBERS
#### 🔴 LỖI 7.1 — Chức năng "Sửa thông tin thành viên" là giả (Mức độ: Critical)
*   **File:** [FamilyMembers.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/FamilyMembers/FamilyMembers.tsx#L154-L158)
*   **Mô tả:** Hàm `handleEdit` nhận tham số `_data` nhưng không gọi bất kỳ API backend nào để cập nhật dữ liệu, chỉ hiện toast thông báo thành công và đóng modal.
*   **Hậu quả:** Thông tin thành viên không thực sự được sửa ở database. Sau khi F5 trang, thông tin cũ sẽ quay lại.
*   **Khắc phục:** Viết code gọi API sửa thành viên: `await familyApi.updateMember(groupId, editMember.id, _data)`.

#### 🔴 LỖI 7.2 — Chức năng "Quản lý quyền" thành viên là giả (Mức độ: Critical)
*   **File:** [FamilyMembers.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/FamilyMembers/FamilyMembers.tsx#L204-L207)
*   **Mô tả:** Tương tự như sửa thông tin, hàm `handleManagePermissions` chỉ hiển thị toast thành công mà không gọi API phân quyền backend.
*   **Hậu quả:** Thay đổi quyền hạn (như chuyển từ MEMBER sang VIEWER) không có tác dụng thực tế.
*   **Khắc phục:** Viết code gọi API cập nhật quyền: `await familyApi.updateMemberRole(groupId, managePerm.id, _data.role)`.

---

### ⚙️ MODULE 8 — SETTINGS (CÀI ĐẶT)
#### 🔴 LỖI 8.1 — Cài đặt thông báo chỉ lưu local state (Mức độ: High)
*   **File:** [Settings.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Settings/Settings.tsx#L124-L136)
*   **Mô tả:** Các công tắc cài đặt thông báo (alert hết hạn, reminder mua sắm) khi bật/tắt chỉ set state React cục bộ, không lưu vào database hay LocalStorage.
*   **Hậu quả:** Khi người dùng refresh trang hoặc đăng nhập lại, các cấu hình thông báo này sẽ bị mất và quay về mặc định.
*   **Khắc phục:** Gọi API lưu cấu hình cài đặt của user hoặc lưu vào LocalStorage/DB khi nhấn nút "Lưu".

#### 🔴 LỖI 8.2 — Tính năng chọn Ngôn ngữ là giả (Mức độ: Medium)
*   **File:** [Settings.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Settings/Settings.tsx#L138-L142)
*   **Mô tả:** Toàn bộ text trong ứng dụng đều được viết cứng bằng tiếng Việt. Khi chọn tiếng Anh và bấm lưu, giao diện không có bất kỳ thay đổi nào.
*   **Hậu quả:** Nút chọn ngôn ngữ chỉ mang tính trưng bày.
*   **Khắc phục:** Tích hợp hệ thống đa ngôn ngữ (như `react-i18next`) hoặc ẩn tính năng này đi nếu chưa phát triển.

#### 🔴 LỖI 8.3 — Nút "Xóa tài khoản" là giả (Mức độ: High)
*   **File:** [Settings.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Settings/Settings.tsx#L144-L146)
*   **Mô tả:** Nút "Xóa tài khoản" chỉ hiện toast cảnh báo chứ không thực hiện xóa dữ liệu thật trên API.
*   **Hậu quả:** Người dùng không thể tự xóa tài khoản của mình khi không còn nhu cầu sử dụng.
*   **Khắc phục:** Hiển thị hộp thoại xác nhận nhiều lớp và gọi API `usersApi.deleteAccount()` để thực hiện xóa tài khoản và đăng xuất.

#### 🔴 LỖI 8.4 — Nút "Tải ảnh đại diện" bị vô hiệu hóa (Mức độ: Low)
*   **File:** [Settings.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Settings/Settings.tsx#L179-L181)
*   **Mô tả:** Khi bấm vào icon máy ảnh để đổi avatar, hệ thống chỉ hiện toast "Tính năng đang phát triển" mà không mở hộp thoại chọn file.
*   **Khắc phục:** Tạo input file ẩn và xử lý upload ảnh đại diện lên server.

---

### 🔑 MODULE 9 — AUTH / NAVIGATION
#### 🔴 LỖI 9.1 — Đường dẫn redirect khi hết hạn phiên làm việc (token expired) bị sai 404 (Mức độ: Critical)
*   **File:** [api.ts](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/services/api.ts#L79)
*   **Mô tả:** Khi access token hết hạn và refresh token thất bại, hệ thống tự động redirect người dùng bằng lệnh:
    ```javascript
    window.location.href = '/login?expired=true';
    ```
    Tuy nhiên, trong cấu hình route của React Router (`routes.tsx`), trang đăng nhập nằm ở đường dẫn `/auth/login`, không phải `/login`.
*   **Hậu quả:** Khi bị hết hạn phiên, người dùng sẽ bị đẩy sang trang lỗi 404 thay vì trang đăng nhập.
*   **Khắc phục:** Sửa đường dẫn redirect thành `/auth/login?expired=true`.

#### 🔴 LỖI 9.2 — Route Dashboard bị trùng lặp (Mức độ: Low)
*   **File:** [routes.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/routes.tsx#L51-L52)
*   **Mô tả:** Giao diện Dashboard được gán cho cả route gốc `/app` và route `/app/dashboard`.
*   **Hậu quả:** Trùng lặp route không cần thiết, làm thanh sidebar khi active không highlight chính xác menu.
*   **Khắc phục:** Chỉ định `/app` tự động redirect sang `/app/dashboard` bằng component `<Navigate to="/app/dashboard" />`.

#### 🔴 LỖI 9.3 — Timeout điều hướng bữa ăn hôm nay có thể xếp chồng (Mức độ: Low)
*   **File:** [Dashboard.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/pages/Dashboard/Dashboard.tsx#L501-L504)
*   **Mô tả:** Khi click vào bữa ăn hôm nay trên Dashboard, code tạo một `setTimeout` 600ms trước khi thực thi `navigate("/app/meal-plan")`.
*   **Hậu quả:** Nếu người dùng click nhanh liên tiếp nhiều lần, nhiều lệnh `setTimeout` sẽ xếp chồng lên nhau gây giật lag giao diện và gọi navigate nhiều lần liên tục.
*   **Khắc phục:** Sử dụng cờ hiệu (flag) `isNavigating` hoặc xóa timeout cũ trước khi tạo timeout mới.

---

### 💻 MODULE 10 — BACKEND
#### 🔴 LỖI 10.1 — Ngưỡng tính toán thực phẩm "sắp hết hạn" bị backend hardcode (Mức độ: Medium)
*   **File:** [inventory.service.ts](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/backend/src/modules/inventory/inventory.service.ts#L29)
*   **Mô tả:** Hàm `getExpiring` của backend luôn truyền tham số cứng là số `3` (ngưỡng 3 ngày) vào cơ sở dữ liệu.
*   **Hậu quả:** Không thể tùy chỉnh ngưỡng cảnh báo hết hạn từ phía người dùng, và không nhất quán với các logic lọc ở frontend.
*   **Khắc phục:** Cho phép truyền tham số số ngày qua query param hoặc lấy từ cấu hình cá nhân của người dùng.

#### 🔴 LỖI 10.2 — Endpoint `getLogs` sử dụng path param thay vì query param (Mức độ: Low)
*   **File:** [api.ts](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/services/api.ts#L230)
*   **Mô tả:** Trong khi các API liên quan đến inventory đều lọc theo nhóm bằng query param `?groupId=`, riêng API lấy nhật ký kho `getLogs` lại sử dụng path param `/inventory/${groupId}/logs`.
*   **Hậu quả:** Thiết kế API không nhất quán, gây khó khăn cho việc bảo trì.
*   **Khắc phục:** Chuẩn hóa API backend và frontend đồng bộ sử dụng query param hoặc path param thống nhất.

#### 🔴 LỖI 10.3 — Kiểm tra `checkRes.ok` dư thừa trong AuthContext (Mức độ: Low)
*   **File:** [AuthContext.tsx](file:///c:/Users/KHANH/Documents/GitHub/DBLAB_ShoppingConvenienceSystem/frontend/src/app/context/AuthContext.tsx#L82)
*   **Mô tả:** Biến `checkRes.ok` đã được kiểm tra ở câu lệnh `if (checkRes.ok)` bên ngoài, tuy nhiên dòng code bên trong lại tiếp tục kiểm tra điều kiện ternary:
    ```javascript
    if (checkRes.ok) {
      const refreshData = await checkRes.ok ? await checkRes.json() : null;
    ```
    Việc gọi `await checkRes.ok` là dư thừa (vì `checkRes.ok` là một boolean chứ không phải Promise).
*   **Hậu quả:** Gây rối code và tạo ra cảnh báo thừa từ TypeScript linter.
*   **Khắc phục:** Sửa thành: `const refreshData = await checkRes.json();`.

---

## 3. PHẦN 2: ĐIỂM YẾU KIẾN TRÚC, LỖI LOGIC NGHIỆP VỤ, EDGE CASES & RỦI RO BẢO MẬT

Dưới đây là các lỗ hổng nghiệp vụ, điểm nghẽn trải nghiệm (pain points) và rủi ro vận hành được phân tích dưới góc nhìn phối hợp của QA, UX/UI và System Analyst.

### 🛡️ Module 1: Auth (Xác thực & Phân quyền)
*   **Xung đột trạng thái gia đình khi mời thành viên:** Một người dùng đã thuộc về Gia đình A nhưng vẫn nhấn tham gia Gia đình B. Hệ thống có thể tự động ép người dùng rời Gia đình A hoặc gây lỗi crash luồng đăng ký/tham gia do ràng buộc DB (1 user chỉ thuộc 1 family).
*   **Liên kết mời (Invitation Link) vô hạn:** Đường dẫn mời tham gia gia đình không có thời gian hết hạn hoặc giới hạn số lần sử dụng. Bất kỳ ai có được liên kết này đều có thể tự ý gia nhập gia đình bất kỳ lúc nào.
*   **Phiên đăng nhập song song không đồng bộ:** Khi người dùng thực hiện đổi mật khẩu trên Thiết bị A, phiên đăng nhập trên Thiết bị B vẫn hoạt động bình thường mà không bị bắt buộc đăng xuất.
*   **Rò rỉ token qua LocalStorage:** Lưu trữ Access/Refresh Token dạng plain text trong LocalStorage, dễ bị tấn công XSS đánh cắp thông tin đăng nhập.
*   **Thiếu Rate Limiting:** Các API Đăng nhập, Đăng ký và Quên mật khẩu không giới hạn tần suất yêu cầu, dễ bị tấn công Brute-force hoặc spam gửi OTP gây nghẽn máy chủ.

### 👨‍👩‍👧‍👦 Module 2: Family (Quản lý thành viên)
*   **Gia đình "vô chủ" (Orphan Family):** Khi chủ hộ (Admin duy nhất) thực hiện hành động xóa tài khoản của chính mình hoặc tự ý rời khỏi gia đình mà không chỉ định một Admin mới. Nhóm gia đình sẽ rơi vào trạng thái không ai có quyền quản trị hoặc giải tán.
*   **Lỗi mất liên kết dữ liệu khi xóa thành viên (Cascade Delete Error):** Khi Admin xóa một thành viên, hệ thống có thể xóa luôn toàn bộ các công thức nấu ăn, danh sách mua sắm do thành viên đó từng tạo, làm ảnh hưởng đến dữ liệu chung của cả gia đình.
*   **Rò rỉ thông tin lịch sử cho thành viên mới:** Thành viên mới gia nhập ngay lập tức có thể xem toàn bộ lịch sử chi tiêu, thói quen ăn uống, thực đơn riêng tư của gia đình từ nhiều năm trước.

### 🏪 Module 3: Inventory (Quản lý kho tủ lạnh)
*   **Xung đột đơn vị đo lường không chuẩn hóa:** Hệ thống cho phép nhập tự do đơn vị ("bó", "gói", "kg", "g"). Khi tính toán, hệ thống không thể tự quy đổi (ví dụ: kho còn "500g", công thức yêu cầu "0.5kg", hệ thống vẫn báo thiếu hàng và yêu cầu đi mua).
*   **Quy trình nhập kho quá thủ công:** Sau khi đi siêu thị về với 20-30 món đồ, việc phải nhập tay từng món một là một điểm nghẽn trải nghiệm rất lớn. Thiếu chức năng quét hóa đơn hoặc mã vạch.
*   **Date Picker bất tiện:** Khi nhập hạn dùng cho thực phẩm ngắn ngày, người dùng vẫn phải mở hộp thoại lịch (Calendar) đầy đủ thay vì có các nút chọn nhanh: "Hôm nay", "Ngày mai", "3 ngày tới".
*   **Nhập số lượng âm/cực đại:** Cho phép người dùng nhập số lượng âm (VD: -5 hộp sữa) hoặc số lượng cực lớn gây vỡ giao diện hoặc lỗi tràn số DB.

### 📅 Module 4: Meal Plan (Lên thực đơn)
*   **Thực đơn đi ngược thời gian:** Cho phép lên thực đơn cho các ngày trong quá khứ, làm sai lệch nghiêm trọng báo cáo thống kê.
*   **Lên thực đơn từ kho rỗng:** Cho phép tạo thực đơn sử dụng các nguyên liệu hoàn toàn không có sẵn trong kho mà không cảnh báo hoặc tự động đề xuất thêm các nguyên liệu thiếu vào Shopping List.
*   **Không tự động điều chỉnh tỷ lệ khẩu phần:** Khi đổi quy mô phần ăn (ví dụ từ 4 người lên 10 người), lượng nguyên liệu dự tính trong thực đơn vẫn giữ nguyên của 4 người, dẫn đến chuẩn bị thiếu thực phẩm.

### 🍳 Module 5: Recipes (Công thức nấu ăn)
*   **Đơn vị định lượng phi kỹ thuật:** Công thức chứa các định lượng không thể đo đếm bằng số như "nêm nếm vừa ăn", "một ít muối", "vài cọng hành". Khi bấm "Tự động thêm vào danh sách mua sắm", hệ thống sẽ bị lỗi tính toán hoặc bỏ qua.
*   **Lỗ hổng Stored XSS trong các bước nấu ăn:** Cho phép nhập định dạng Markdown hoặc HTML để viết hướng dẫn nấu ăn nhưng thiếu bộ lọc làm sạch mã độc. Kẻ tấn công có thể chèn script độc hại vào công thức công khai để đánh cắp token của người xem.
*   **Tải lên tập tin độc hại giả dạng hình ảnh:** Nếu backend không kiểm tra định dạng nội dung tệp thực tế (MIME type validation) khi upload ảnh công thức, kẻ xấu có thể upload shell script để hack server.

### 🛒 Module 6: Shopping List (Danh sách mua sắm)
*   **Mua xong nhưng không nhập kho:** Đánh dấu "Đã mua" cho toàn bộ danh sách đồ đi chợ nhưng hệ thống không tự động cộng số lượng đó vào kho (Inventory) của gia đình họ, bắt buộc họ phải vào Module Inventory để tự tay gõ nhập kho lại từ đầu.
*   **Lỗ hổng mất kết nối ở siêu thị (Offline-first failure):** Siêu thị thường là các tầng hầm sóng yếu hoặc mất mạng. Nếu ứng dụng không hỗ trợ lưu trữ tạm thời dưới thiết bị (Offline cache/IndexedDB) và đồng bộ lại khi có mạng, người dùng sẽ không thể tích chọn đồ khi đang đi chợ thực tế.
*   **Giao diện đi chợ không tối ưu cho một tay:** Khi tay xách nách mang ở siêu thị, các nút check "Đã mua" quá nhỏ hoặc nằm ở vị trí khó bấm bằng một ngón tay cái.

### 📊 Module 7: Reports (Báo cáo & Thống kê)
*   **Lệch múi giờ trong thống kê chi tiêu (Timezone Offset Bug):** Máy chủ hoạt động ở múi giờ UTC, nếu thanh toán vào lúc 23:30 ngày 31/12 tại Việt Nam (UTC+7), hóa đơn có thể bị ghi nhận sang ngày 01/01 năm sau, làm sai lệch báo cáo tài chính năm.
*   **Lỗi chia cho 0 (Division by Zero) ở tài khoản mới:** Gia đình mới tạo tài khoản chưa mua sắm gì, khi vào trang Báo cáo sẽ bị crash trắng màn hình do hệ thống thực hiện phép tính chia cho tổng số lượng bằng 0.
*   **Lọc khoảng thời gian vô lý:** Chọn ngày bắt đầu lớn hơn ngày kết thúc, hoặc chọn khoảng thời gian 100 năm gây treo DB do quá tải dữ liệu.

---

## 4. LỘ TRÌNH KHẮC PHỤC KHUYẾN NGHỊ

Để dự án hoạt động ổn định và sẵn sàng cho môi trường thực tế, quá trình sửa lỗi nên được chia làm 3 giai đoạn chính:

### 🚀 Giai đoạn 1: Khắc Phục Lỗi Logic Codebase (Ưu tiên số 1)
*   Sửa lỗi **LỖI 3.1** (Modal thêm thủ công kho) để người dùng có thể thêm thực phẩm bình thường.
*   Sửa lỗi **LỖI 9.1** (Redirect 404 khi hết hạn token) để tránh hỏng luồng xác thực người dùng.
*   Sửa lỗi **LỖI 1.2 & 1.3** để luồng thêm bữa ăn từ Dashboard chạy đúng thông tin ngày và món ăn được chọn.
*   Sửa lỗi **LỖI 2.1** (Tính toán chi tiêu sai do operator precedence) để báo cáo tiền tệ chính xác.
*   Sửa lỗi **LỖI 4.1** (Bữa phụ bị map sai thành bữa tối) và **LỖI 5.3** (Lọc thiếu công thức gia đình).
*   Sửa lỗi **LỖI 7.1 & 7.2** để thông tin thành viên và quyền hạn được lưu thật vào database.

### 🔒 Giai đoạn 2: Tăng Cường Bảo Mật & Toàn Vẹn Dữ Dữ Liệu (Ưu tiên số 2)
*   Kiểm tra và vá các lỗ hổng IDOR trên API bằng cách kiểm tra quyền sở hữu `groupId` trước khi cho phép xem/sửa/xóa dữ liệu.
*   Thêm bộ lọc làm sạch mã độc (Sanitization) cho các trường nhập liệu Markdown của công thức để chống Stored XSS.
*   Thêm ràng buộc unique index và các cơ chế khóa giao dịch đồng thời (Optimistic Concurrency Control - OCC) cho các thực phẩm kho và chi tiêu gia đình.
*   Thiếu nhật ký hành động (Audit Log) cho Admin hệ thống và các thành viên gia đình để dễ dàng tra cứu khi có biến động.

### 📱 Giai đoạn 3: Tối Ưu Trải Nghiệm Người Dùng (UX/UI) & Tính Năng Offline
*   Sửa lỗi **LỖI 5.2** (Tránh infinite loop trong CookingModal) và thêm dialog xác nhận xóa công thức (**LỖI 5.1**).
*   Thêm cơ chế lưu trữ offline (Offline Cache/IndexedDB) cho danh sách mua sắm để phục vụ khi đi chợ không có mạng.
*   Chuyển đổi các chức năng xuất PDF giả, tạo thực đơn tự động giả thành các tính năng thật.
*   Tối ưu hóa giao diện checklist mua sắm (Shopping List) với các nút bấm to hơn để dễ dàng thao tác bằng một tay.
