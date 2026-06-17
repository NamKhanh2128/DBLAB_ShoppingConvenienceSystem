# BUG REPORT — DBLAB Shopping Convenience System
> Audit Level: Senior Staff Engineer + Security Engineer + QA Lead + SRE  
> Audit Date: 2026-06-17  
> Auditor: Antigravity AI (Production Audit)  
> Scope: Full-stack — Backend (Node/Express/TypeScript) + Frontend (React 18/Vite) + Database (MSSQL)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical (10) | 5 |
| 🟠 High (8–9) | 13 |
| 🟡 Medium (5–7) | 17 |
| 🟢 Low (1–4) | 12 |
| **Total** | **47** |

**Các nguy cơ nghiêm trọng nhất:**
- `authorizeRole` bypass hoàn toàn trên localhost — mọi user đều có quyền Admin
- `requireGroupRole` bypass hoàn toàn trên localhost — IDOR không được bảo vệ
- Access Token lưu trong `localStorage` — XSS dẫn đến chiếm tài khoản
- `deductInventoryForCooking` không có transaction — race condition gây mất đồng bộ kho
- `changePassword` không cập nhật `MatKhauNgayCapNhat` — token cũ vẫn hợp lệ sau đổi mật khẩu
- `getStats()` dùng trạng thái `BANNED`/`INACTIVE` không tồn tại trong DB schema

---

## 🔴 CRITICAL (Severity 10)

---

### BUG-001

**Severity:** Critical (10)  
**Category:** Security — Broken Access Control  

**Files involved:**
- `backend/src/core/middleware/role.middleware.ts` (Lines 8–12)
- `backend/src/modules/admin/admin.route.ts` (Line 8)

**Root cause:**  
`authorizeRole` kiểm tra `req.hostname === 'localhost'` và nếu đúng thì gọi `next()` **không điều kiện**, bỏ qua hoàn toàn kiểm tra vai trò (`ADMIN`, `MODERATOR`). Điều này có nghĩa là bất kỳ user thường nào truy cập từ localhost đều có full quyền Admin.

```typescript
// role.middleware.ts (Lines 8-12)
const isLocalDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
if (isLocalDev) {
  next(); // ← BYPASS HOÀN TOÀN — không kiểm tra role
  return;
}
```

**Reproduction:**
1. Có tài khoản user thường (VaiTro = 'MEMBER')
2. Truy cập `POST /api/v1/admin/users/1/status` với token user thường
3. Nếu server chạy localhost → request thành công, user thường có thể đổi status bất kỳ user nào

**Impact:**  
Bất kỳ user đã đăng nhập nào chạy từ localhost đều có toàn quyền Admin: xem tất cả users, khóa/mở khóa tài khoản, thay đổi role, xóa user, xem audit logs. Đây là privilege escalation nghiêm trọng.

**Recommended fix:**  
Xóa hoàn toàn khối `isLocalDev` bypass. Kiểm tra role phải luôn thực thi bất kể môi trường.

**Confidence:** High

---

### BUG-002

**Severity:** Critical (10)  
**Category:** Security — Broken Access Control / IDOR  

**Files involved:**
- `backend/src/core/middleware/role.middleware.ts` (Lines 35–38)

**Root cause:**  
`requireGroupRole` cũng có cùng pattern bypass localhost. Mặc dù middleware này không được dùng trong các route chính hiện tại, nhưng đây là một anti-pattern cực kỳ nguy hiểm nếu được áp dụng.

```typescript
// role.middleware.ts (Lines 35-38)
const isLocalDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
if (isLocalDev) {
  next(); // ← Bỏ qua kiểm tra membership + role trong nhóm
  return;
}
```

**Reproduction:**
Tương tự BUG-001: localhost bypass toàn bộ kiểm tra `ThanhVienNhom`.

**Impact:**  
IDOR hoàn toàn: bất kỳ user nào từ localhost có thể thao tác dữ liệu của bất kỳ nhóm nào mà không cần là thành viên.

**Recommended fix:**  
Xóa khối `isLocalDev` bypass.

**Confidence:** High

---

### BUG-003

**Severity:** Critical (10)  
**Category:** Security — Sensitive Data Exposure / XSS Attack Vector  

**Files involved:**
- `frontend/src/app/services/api.ts` (Lines 4–12)
- `frontend/src/app/context/AuthContext.tsx` (Lines 37–45, 89–93)

**Root cause:**  
Access Token được lưu trong `localStorage` và `memoryToken`. `localStorage` có thể đọc bởi bất kỳ JavaScript nào chạy trên trang — đây là mục tiêu chính của XSS attack. Bất kỳ third-party script, browser extension, hoặc XSS payload nào cũng có thể lấy token.

```typescript
// api.ts Lines 9-12
export const setToken = (token: string) => { 
  memoryToken = token; 
  localStorage.setItem('accessToken', token); // ← XSS target
};
```

Đồng thời, `user` object (chứa `MaNguoiDung`, email, role) cũng được lưu trong `localStorage` tại `api.ts` line 22.

**Reproduction:**
1. Inject payload: `localStorage.getItem('accessToken')` trong developer console
2. Token có thể bị đọc ngay

**Impact:**  
Token bị đánh cắp → chiếm tài khoản hoàn toàn. Access Token có TTL 15 phút nhưng Refresh Token có thể được dùng liên tục qua HttpOnly cookie — nếu attacker có cả 2, session bị chiếm vĩnh viễn.

**Recommended fix:**  
Chỉ lưu Access Token trong `memoryToken` (in-memory). Không lưu vào `localStorage`. Khi F5, dùng Refresh Token (HttpOnly cookie) để lấy lại Access Token mới.

**Confidence:** High

---

### BUG-004

**Severity:** Critical (10)  
**Category:** Security — Authentication Bypass  

**Files involved:**
- `backend/src/modules/users/users.service.ts` (Lines 40–53)
- `backend/src/modules/users/users.repository.ts` (Lines 70–80)

**Root cause:**  
`changePassword` hash và cập nhật `MatKhauHash` nhưng **không cập nhật `MatKhauNgayCapNhat`**. Theo thiết kế của `authenticate` middleware, JWT được invalidate dựa trên field `MatKhauNgayCapNhat` so với `pwdUpdatedAt` trong token. Nếu field này không được cập nhật, tất cả JWT cũ vẫn tiếp tục hợp lệ sau khi đổi mật khẩu.

```typescript
// users.repository.ts Lines 70-80
async updatePassword(id: number, hashedPassword: string): Promise<void> {
  await pool.request()
    .query(`
      UPDATE NguoiDung
      SET MatKhauHash = @pw, NgayCapNhat = GETDATE()
      // ← THIẾU: MatKhauNgayCapNhat = GETUTCDATE()
      WHERE MaNguoiDung = @id
    `);
}
```

**Reproduction:**
1. Đăng nhập, lấy JWT A
2. Đổi mật khẩu
3. JWT A vẫn hợp lệ cho đến khi hết hạn (15 phút) vì `MatKhauNgayCapNhat` không thay đổi

**Impact:**  
Nếu token bị lộ, sau khi nạn nhân đổi mật khẩu, attacker vẫn có thể tiếp tục sử dụng token cũ trong vòng 15 phút.

**Recommended fix:**  
Thêm `MatKhauNgayCapNhat = GETUTCDATE()` vào câu UPDATE trong `updatePassword`.

**Confidence:** High

---

### BUG-005

**Severity:** Critical (10)  
**Category:** Database — Race Condition / Data Integrity  

**Files involved:**
- `backend/src/modules/recipes/recipes.repository.ts` (Lines 208–263)

**Root cause:**  
`deductInventoryForCooking` thực hiện nhiều UPDATE riêng lẻ (mỗi nguyên liệu một query) **không trong transaction**. Nếu server crash hoặc kết nối ngắt giữa chừng, một số nguyên liệu bị trừ, một số không — kho bị mất đồng bộ.

Ngoài ra, không có UPDLOCK khi đọc `ing.SoLuong` → race condition: 2 user cùng nấu cùng lúc có thể cùng "đọc" số lượng còn đủ nhưng khi update thì trừ dư ra mức âm.

```typescript
// recipes.repository.ts Lines 231-258
for (const ing of ingredients) {
  const needed = ing.SoLuongCan * multiplier;
  if (ing.SoLuong >= needed) {
    // ← Không có transaction, không có lock
    await pool.request().query(`UPDATE KhoThucPham SET SoLuong = SoLuong - @soLuong ...`);
  }
}
```

**Reproduction:**
1. Kho có 5 trứng
2. 2 user cùng nhấn "Đã nấu xong" recipe cần 3 trứng
3. Cả 2 đọc `SoLuong = 5 >= 3` → cả 2 trừ 3 → kho còn -1 trứng

**Impact:**  
Kho thực phẩm âm, mất đồng bộ dữ liệu, báo cáo lãng phí sai, không thể tin tưởng số liệu tồn kho.

**Recommended fix:**  
Wrap toàn bộ loop trong một SQL Transaction; sử dụng `WITH (UPDLOCK, ROWLOCK)` khi SELECT; kiểm tra `SoLuong >= needed` trong mệnh đề WHERE của UPDATE để tránh race condition.

**Confidence:** High

---

## 🟠 HIGH (Severity 8–9)

---

### BUG-006

**Severity:** High (9)  
**Category:** Security — Information Disclosure  

**Files involved:**
- `backend/src/core/middleware/error.middleware.ts` (Lines 10–14)

**Root cause:**  
Khi `NODE_ENV === 'development'`, stack trace đầy đủ được trả về trong response body. Nếu server được deploy mà `NODE_ENV` không được set, mặc định cũng bị lộ stack trace vì điều kiện là `=== 'development'` (chỉ ẩn khi không phải development, không phải chặn khi là production).

```typescript
res.status(statusCode).json({
  success: false,
  message,
  ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
});
```

Trong `InventoryController` (Lines 12–14), `InventoryController` (Lines 23–24), `InventoryController` (Lines 57–58): nếu `NODE_ENV` không được set, `groupId = 1` được hardcode — nghĩa là mọi request đều xem inventory của nhóm 1.

**Impact:**  
Stack trace leak tiết lộ file paths, library versions, code structure — thông tin hữu ích cho attacker.

**Recommended fix:**  
Chỉ trả stack trace khi `NODE_ENV === 'development'` (đã đúng) nhưng phải đảm bảo production luôn set `NODE_ENV=production`.

**Confidence:** High

---

### BUG-007

**Severity:** High (9)  
**Category:** Security — Hardcoded Dev Bypass / IDOR  

**Files involved:**
- `backend/src/modules/inventory/inventory.controller.ts` (Lines 12–14, 23–25, 56–59)

**Root cause:**  
`InventoryController` có pattern: nếu `groupId` không được truyền **VÀ** `NODE_ENV` là development hoặc không được set → hardcode `groupId = 1`. Điều này có nghĩa là bất kỳ request nào thiếu `groupId` sẽ mặc nhiên xem/thêm/xóa inventory của nhóm 1.

```typescript
// inventory.controller.ts Lines 11-14
let groupId = Number(req.query.groupId);
if ((!groupId || isNaN(groupId)) && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
  groupId = 1; // ← hardcode nhóm 1
}
```

**Reproduction:**
1. Gọi `GET /api/v1/inventory` (bỏ qua groupId)
2. Nếu NODE_ENV không set → trả về inventory của nhóm 1

**Impact:**  
User bất kỳ có thể xem/thêm/xóa thực phẩm trong kho của nhóm 1 mà không cần là thành viên.

**Recommended fix:**  
Xóa fallback hardcode. Trả về 400 nếu thiếu `groupId`. Để service/middleware kiểm tra membership.

**Confidence:** High

---

### BUG-008

**Severity:** High (9)  
**Category:** Logic — Authentication  

**Files involved:**
- `backend/src/modules/users/users.service.ts` (Lines 72–77)

**Root cause:**  
`getStats()` đếm user theo trạng thái `'BANNED'` và `'INACTIVE'` nhưng theo DB schema (`AGENTS.md`, bảng `NguoiDung`), cột `TrangThai` chỉ có 2 giá trị hợp lệ: `'ACTIVE'` và `'LOCKED'`. `'BANNED'` và `'INACTIVE'` không tồn tại → luôn trả về 0, báo cáo sai.

```typescript
// users.service.ts Lines 72-77
async getStats() {
  const total    = await this.repo.countAll();
  const active   = await this.repo.countByStatus('ACTIVE');
  const banned   = await this.repo.countByStatus('BANNED');   // ← Không tồn tại
  const inactive = await this.repo.countByStatus('INACTIVE'); // ← Không tồn tại
  return { total, active, banned, inactive };
}
```

Admin Repository (Lines 23–24) cũng lọc `TrangThai != 'DELETED'` trong khi schema chỉ có `ACTIVE`/`LOCKED` — vô hiệu quả nhưng không sai. Tuy nhiên, `deleteUser` (Line 78) đặt status = `'DELETED'` không có trong schema, và `updateStatus` (Line 60) không validate giá trị đầu vào.

**Impact:**  
Dashboard Admin luôn hiển thị 0 users bị banned và 0 users inactive → misleading data.

**Recommended fix:**  
Đồng bộ enum: dùng `'LOCKED'` thay vì `'BANNED'`, remove `'INACTIVE'`. Hoặc cập nhật DB schema để thêm các trạng thái mới.

**Confidence:** High

---

### BUG-009

**Severity:** High (8)  
**Category:** Security — Missing Input Validation  

**Files involved:**
- `backend/src/modules/admin/admin.route.ts` (Lines 12–14)
- `backend/src/modules/admin/admin.service.ts` (Lines 28, 39)

**Root cause:**  
`PATCH /admin/users/:id/status` và `PATCH /admin/users/:id/role` không có Zod validation. `status` và `role` được truyền thẳng vào SQL query mà không kiểm tra whitelist. Attacker có thể set `TrangThai = 'ACTIVE'; DROP TABLE NguoiDung--'` — tuy nhiên vì dùng parameterized query nên SQL injection bị chặn, nhưng vẫn có thể set status thành giá trị tùy ý.

```typescript
// admin.service.ts Line 28
await this.repo.updateUserStatus(id, status); // status không được validate
```

**Impact:**  
Admin có thể đặt TrangThai thành bất kỳ string nào (ví dụ `'SUPERADMIN'`, `'DELETED'`), phá vỡ business logic. Tuy nhiên chỉ Admin mới gọi được endpoint này nên severity là High không phải Critical.

**Recommended fix:**  
Thêm whitelist validation: `status` chỉ nhận `['ACTIVE', 'LOCKED']`, `role` chỉ nhận `['ADMIN', 'MEMBER']`.

**Confidence:** High

---

### BUG-010

**Severity:** High (8)  
**Category:** Logic — Business Rule Violation  

**Files involved:**
- `backend/src/modules/inventory/inventory.controller.ts` (Line 56)
- `backend/src/modules/inventory/inventory.route.ts` (Line 9)

**Root cause:**  
Route `GET /inventory/:groupId/logs` dùng `req.params.groupId` để lấy audit logs, nhưng trong `getLogs` controller (Line 56), biến được đọc là `req.params.groupId` thay vì `req.query.groupId`. Trong khi đó, Frontend (`useData.ts` Line 22) gọi `inventoryApi.getLogs(groupId)` → `GET /inventory/logs?groupId=X` — truyền qua **query** không phải **params**.

```typescript
// inventory.route.ts Line 9
router.get('/:groupId/logs', ctrl.getLogs.bind(ctrl)); // ← params
// inventory.controller.ts Line 56
let groupId = Number(req.params.groupId); // ← đọc params
// api.ts Line 251
request<...>(`/inventory/logs?groupId=${groupId}`) // ← Frontend gửi query, không phải params
```

**Reproduction:**
1. Gọi `GET /api/v1/inventory/logs?groupId=1` 
2. Server hiểu là `GET /inventory/logs` với params `groupId` là `undefined` → về route `/inventory/:groupId/logs` sẽ match `logs` là groupId → `groupId = NaN` → hardcode về 1 (nếu dev mode)

**Impact:**  
Inventory logs luôn trả về nhóm 1 (hoặc 404/500 ở production), không trả về đúng nhóm của user. Tính năng bị hỏng hoàn toàn.

**Recommended fix:**  
Đồng bộ: hoặc đổi route thành `GET /inventory/logs?groupId=X` (query params) hoặc đổi frontend sang `GET /inventory/:groupId/logs` (path params).

**Confidence:** High

---

### BUG-011

**Severity:** High (8)  
**Category:** Logic — Race Condition  

**Files involved:**
- `backend/src/modules/shopping/shopping.service.ts` (referenced by context)
- `backend/src/modules/shopping/shopping.repository.ts` (upsertInventoryItem)

**Root cause:**  
`completeAndRestock` gọi `upsertInventoryItem` nhiều lần trong một vòng loop — mỗi upsert là một query riêng lẻ không trong transaction. Nếu 2 thành viên gia đình cùng nhấn "Hoàn thành & Nhập kho" cùng lúc, có thể xảy ra duplicate insert hoặc số lượng bị cộng sai.

**Impact:**  
Kho bị duplicate items hoặc số lượng không chính xác sau khi hoàn thành mua sắm.

**Recommended fix:**  
Wrap toàn bộ `completeAndRestock` trong một SQL Transaction.

**Confidence:** Medium

---

### BUG-012

**Severity:** High (8)  
**Category:** Logic — Infinite Refresh Loop  

**Files involved:**
- `frontend/src/app/services/api.ts` (Lines 68–96)

**Root cause:**  
Khi token hết hạn, `request()` trigger `handleRefresh()`. Nếu refresh thành công → retry request. **Tuy nhiên**, nếu retry request cũng trả về 401 (ví dụ token mới không hợp lệ ngay lập tức), **code KHÔNG retry thêm lần nào** (đây là đúng). 

**Nhưng bug thực sự là:** sau khi `isRefreshing = true` và refresh thất bại (`handleRefresh` trả null), code gọi `window.location.href = '/auth/login?expired=true'` VÀ throw Error. Tuy nhiên, các request đang chờ trong `refreshSubscribers` array **không được resolve/reject** — họ treo vĩnh viễn (Promise leak).

```typescript
// api.ts Lines 74-80
if (newToken) {
  onRefreshed(newToken); // ← OK
} else {
  localStorage.removeItem('groupId');
  window.location.href = '/auth/login?expired=true'; // ← redirect
  throw new Error('Phiên làm việc đã hết hạn...'); // ← throw, không reject subscribers
  // Các Promises trong refreshSubscribers bị leak vĩnh viễn
}
```

**Impact:**  
Memory leak: khi refresh token thất bại, tất cả pending requests trở thành zombie Promises không bao giờ settle. Trên các SPA có nhiều concurrent requests, đây gây rò rỉ bộ nhớ.

**Recommended fix:**  
Khi refresh thất bại, gọi `onRefreshed(null)` hoặc reject tất cả subscribers trước khi redirect.

**Confidence:** High

---

### BUG-013

**Severity:** High (8)  
**Category:** Logic — Incorrect Business Logic  

**Files involved:**
- `backend/src/modules/recipes/recipes.repository.ts` (Lines 236–244)

**Root cause:**  
Trong `deductInventoryForCooking`, khi trừ kho thành công (Line 242):
```sql
SET SoLuong = SoLuong - @soLuong,
    TrangThai = CASE WHEN SoLuong - @soLuong <= 0 THEN 'HET' ELSE TrangThai END
```
`TrangThai` được set thành `'HET'` nhưng schema định nghĩa chỉ có `'CON_HAN'` và `'HET_HAN'`. `'HET'` không tồn tại trong enum của DB → inconsistent state, báo cáo expiry sẽ không nhận dạng được.

**Impact:**  
Sau khi nấu ăn, thực phẩm hết có status `'HET'` thay vì `'HET_HAN'` → không xuất hiện trong báo cáo lãng phí, không bị cảnh báo, không bị đánh dấu là hết hạn.

**Recommended fix:**  
Đổi `'HET'` thành `'HET_HAN'` hoặc xử lý bằng cách xóa item khi `SoLuong = 0`.

**Confidence:** High

---

### BUG-014

**Severity:** High (8)  
**Category:** Logic — Incorrect Business Logic  

**Files involved:**
- `backend/src/modules/recipes/recipes.service.ts` (Lines 133–135)

**Root cause:**  
`cookRecipe` tính `multiplier = validated.soKhauPhan / defaultServings` nhưng `defaultServings = recipe.KhauPhan || 1`. Nếu công thức có `KhauPhan = null` → `defaultServings = 1` → multiplier = soKhauPhan (rất lớn) → trừ kho gấp N lần.

Ví dụ: recipe mặc định 4 người, user nấu 4 người, nhưng `recipe.KhauPhan` là null → `defaultServings = 1` → `multiplier = 4` → trừ kho gấp 4 lần so với đúng.

**Impact:**  
Kho bị trừ sai số lượng. Các công thức không có `KhauPhan` được đặt sẽ trừ sai tỷ lệ nguyên liệu.

**Recommended fix:**  
Không dùng `|| 1` làm fallback. Nếu `KhauPhan` là null, trả về lỗi yêu cầu người dùng nhập số khẩu phần.

**Confidence:** High

---

### BUG-015

**Severity:** High (8)  
**Category:** API — Response Mismatch  

**Files involved:**
- `frontend/src/app/services/api.ts` (Lines 212–216)
- `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` (Lines 354–368)

**Root cause:**  
Frontend `completeAndRestock` API call expect response shape:
```typescript
{ total: number; addedToInventory: number; mergedWithExisting: number; message: string }
```
Nhưng `ShoppingList.tsx` (Line 362) accesses `result.addedToInventory` và `result.mergedWithExisting`. Nếu backend trả về field names khác (không thể verify vì không có `shopping.service.ts` đầy đủ) → `undefined` values hiển thị thay vì số thực.

**Impact:**  
Toast message hiển thị `"Thêm mới undefined món · Cộng thêm undefined món hiện có"`.

**Recommended fix:**  
Kiểm tra và đồng bộ field names giữa backend response và frontend expectation. Thêm null check.

**Confidence:** Medium

---

### BUG-016

**Severity:** High (8)  
**Category:** Frontend — React Hook Dependency Bug  

**Files involved:**
- `frontend/src/app/hooks/useData.ts` (Lines 296–298)

**Root cause:**  
`useReports` có `useEffect` với dependency `[groupId]` (Line 297–299) nhưng `load` function có dependency bao gồm `filters` (Line 294). Khi `filters` thay đổi, `load` recreate nhưng `useEffect` không re-run vì không có `load` trong dependency array.

```typescript
// useData.ts Lines 277-298
const load = useCallback(async (customFilters?...) => {
  ...
}, [groupId, filters]); // load phụ thuộc filters

useEffect(() => {
  load(); // ← nhưng không có `load` trong deps
}, [groupId]); // ← chỉ có groupId
```

**Impact:**  
Khi user thay đổi nhóm gia đình (groupId thay đổi), báo cáo reload đúng. Nhưng logic `filters` stale closure — có thể gây stale data trong một số edge case.

**Recommended fix:**  
Thêm `load` vào dependency array của `useEffect`: `[groupId, load]` (nhưng cần đảm bảo `load` không infinite loop bởi `filters` thay đổi).

**Confidence:** Medium

---

### BUG-039

**Severity:** High (8)  
**Category:** Backend / Frontend — Missing API Routes  

**Files involved:**
- `frontend/src/app/pages/FamilyMembers/FamilyMembers.tsx` (Lines 213–217, 233, 299)
- `frontend/src/app/services/api.ts` (Lines 389–399)
- `backend/src/modules/family/family.route.ts`
- `backend/src/modules/family/family.controller.ts`
- `backend/src/modules/family/family.service.ts`

**Root cause:**  
Trong giao diện quản lý thành viên gia đình (`FamilyMembers.tsx`), việc chỉnh sửa thông tin thành viên gọi hàm `familyApi.updateMember` (trỏ tới `PUT /family/:groupId/members/:userId`) và việc phân quyền gọi hàm `familyApi.updateMemberRole` (trỏ tới `PATCH /family/:groupId/members/:userId/role`). Tuy nhiên, cả hai endpoint này hoàn toàn không được khai báo trong định tuyến (`family.route.ts`), bộ điều phối (`family.controller.ts`) hay dịch vụ xử lý logic (`family.service.ts`) phía backend.

**Reproduction:**
1. Truy cập trang "Thành viên gia đình".
2. Bấm vào nút "Sửa" trên bất kỳ thẻ thành viên nào, chỉnh sửa thông tin hoặc thay đổi quyền hạn của họ và bấm "Lưu".
3. Thao tác thất bại và nhận lỗi HTTP 404 từ backend do không tìm thấy route.

**Impact:**  
Người dùng không thể cập nhật thông tin cá nhân của các thành viên hoặc điều chỉnh vai trò/quyền hạn trong gia đình. Tính năng bị lỗi nghiêm trọng trên thực tế.

**Recommended fix:**  
Bổ sung các phương thức `updateMember` và `updateMemberRole` vào `FamilyService` và `FamilyController`, đồng thời khai báo các route tương ứng trong `family.route.ts`.

**Confidence:** High

---

### BUG-040

**Severity:** High (8)  
**Category:** Frontend — Mocked Feature  

**Files involved:**
- `frontend/src/app/pages/Admin/MasterData/MasterData.tsx`

**Root cause:**  
Trang quản lý dữ liệu gốc (Master Data) của Admin hoạt động hoàn toàn trên các mảng tĩnh lưu trong bộ nhớ tạm React (`initialIngredients`, `initialRecipes`, `initialCategories`). Không có bất kỳ API backend nào được gọi để ghi nhận hay lưu trữ các thay đổi khi thêm, sửa hoặc xóa dữ liệu. Khi bấm "Thêm danh mục", hệ thống chỉ hiển thị toast cảnh báo giả lập dạng "đang phát triển".

**Reproduction:**
1. Vào mục Admin -> Quản lý dữ liệu gốc.
2. Thực hiện chỉnh sửa thông tin nguyên liệu hoặc thêm một công thức nấu ăn mới.
3. Tải lại (Refresh) trang. Mọi thay đổi vừa thực hiện đều biến mất, dữ liệu bị khôi phục về trạng thái ban đầu của mã nguồn.

**Impact:**  
Quản trị viên không thể thực tế quản lý cơ sở dữ liệu dùng chung (master data) như danh mục thực phẩm mẫu, công thức hệ thống. Tính năng này hoàn toàn là giao diện giả (mockup).

**Recommended fix:**  
Xây dựng các API CRUD cho dữ liệu gốc (Ingredients, Recipes, Categories) ở backend, cập nhật `api.ts` phía client và thay thế state cục bộ của `MasterData.tsx` bằng các cuộc gọi API thực tế.

**Confidence:** High

---

## 🟡 MEDIUM (Severity 5–7)

---

### BUG-017

**Severity:** Medium (7)  
**Category:** Logic — Incorrect Date Comparison  

**Files involved:**
- `backend/src/modules/meal-plan/meal-plan.validation.ts` (Lines 5–15)
- `backend/src/modules/meal-plan/meal-plan.service.ts` (Lines 96–102)

**Root cause:**  
`createMealPlanSchema` và `copyMealPlanRange` đều so sánh ngày bằng `new Date()` của **server** (UTC). Server chạy ở UTC nhưng user ở UTC+7. Ví dụ: lúc 23:30 ngày 17/06 (VN giờ), server thấy là 16:30 UTC ngày 17/06 — lên kế hoạch cho ngày 17/06 vẫn OK. Nhưng từ 0:00 đến 7:00 sáng VN, server thấy là ngày hôm trước UTC → reject kế hoạch cho ngày hôm nay vì server cho là "ngày quá khứ".

**Impact:**  
Trong khung giờ 0:00–7:00 AM (giờ VN), user không thể lên kế hoạch bữa ăn cho ngày hôm đó — hệ thống báo "không được đặt trong quá khứ".

**Recommended fix:**  
Sử dụng `clientDate` được gửi lên từ frontend (đã được xử lý đúng trong `mealPlanApi.getToday`) để validate thay vì `new Date()` của server.

**Confidence:** High

---

### BUG-018

**Severity:** Medium (7)  
**Category:** Logic — Missing Ingredient Match Logic  

**Files involved:**
- `backend/src/modules/meal-plan/meal-plan.service.ts` (Lines 120–140)

**Root cause:**  
`checkIngredientsSufficiency` match nguyên liệu bằng tên (`TenTP`) với fuzzy string match `toLowerCase().trim()` nhưng **không tính đến đơn vị**. Nếu kho có "Thịt heo 500g" và công thức cần "Thịt heo 200ml" → match thành công dù đơn vị khác nhau.

Ngoài ra, match theo `TenTP` nhưng `KhoThucPham` không có unique constraint trên `TenTP` → nhiều lô cùng tên được cộng dồn (`reduce`) dù đơn vị khác nhau.

**Impact:**  
Báo cáo nguyên liệu sai: hệ thống báo "đủ nguyên liệu" khi thực tế đơn vị không tương đương (gram vs ml vs cái).

**Recommended fix:**  
Match cả `TenTP` và `DonVi`. Hoặc warning khi đơn vị không khớp.

**Confidence:** High

---

### BUG-019

**Severity:** Medium (7)  
**Category:** Logic — Incorrect Serving Assumption  

**Files involved:**
- `backend/src/modules/meal-plan/meal-plan.service.ts` (Lines 121–122)

**Root cause:**  
`checkIngredientsSufficiency` hard-code giả định công thức gốc luôn là cho **4 người**:
```typescript
const requiredQty = ing.SoLuongCan * (soKhauPhan / 4); // ← hardcode 4
```
Nhưng `NguyenLieuMon.SoLuongCan` được định nghĩa theo khẩu phần gốc của công thức (`MonAn.KhauPhan`). Nếu công thức có `KhauPhan = 2`, tính toán sai hoàn toàn.

**Impact:**  
Kiểm tra nguyên liệu cho tất cả công thức không phải 4 người đều sai. Ví dụ: recipe cho 2 người, user nấu 4 → system tính `required = SoLuongCan * (4/4) = SoLuongCan` thay vì `SoLuongCan * 2`.

**Recommended fix:**  
Lấy `KhauPhan` từ `MonAn` và dùng: `requiredQty = ing.SoLuongCan * (soKhauPhan / recipe.KhauPhan)`.

**Confidence:** High

---

### BUG-020

**Severity:** Medium (7)  
**Category:** Database — Schema Inconsistency  

**Files involved:**
- `backend/src/modules/reports/reports.repository.ts` (Lines 132–136)

**Root cause:**  
`BaoCaoChiTieu.create()` INSERT với columns `SoThanhVien` và `TongCalo` nhưng theo `AGENTS.md` schema của bảng `BaoCaoChiTieu`, các cột này **không được liệt kê**. Schema chỉ có: `MaBaoCao, MaNhom, TuanThang, TongChiPhi, TongLangPhi`.

```sql
INSERT INTO BaoCaoChiTieu (MaNhom, TuanThang, TongChiPhi, TongLangPhi, SoThanhVien, TongCalo, NgayTao)
-- ↑ SoThanhVien và TongCalo có thể không tồn tại trong schema gốc
```

**Impact:**  
Nếu các columns này tồn tại trong DB (từ migration) thì OK, nhưng nếu migration chưa chạy → SQL error. Reports.tsx cũng hiển thị `r.SoThanhVien` (Line 617) → nếu không có column, hiển thị `undefined`.

**Recommended fix:**  
Kiểm tra migration scripts để verify columns tồn tại. Cập nhật `AGENTS.md` schema cho đúng.

**Confidence:** Medium

---

### BUG-021

**Severity:** Medium (7)  
**Category:** Database — N+1 Query  

**Files involved:**
- `backend/src/modules/reports/reports.repository.ts` (Lines 39–64)

**Root cause:**  
Trong `summaryQuery`, có subquery correlated lồng nhau để tính giá:
```sql
SELECT TOP 1 sub.GiaThucTe 
FROM ChiTietMuaSam sub 
INNER JOIN DanhSachMuaSam subDs ON ...
WHERE subDs.MaNhom = @g AND sub.TenThucPham = kp.TenTP ...
ORDER BY subDs.NgayTao DESC
```
Query này chạy cho **mỗi row** trong `KhoThucPham WHERE TrangThai = 'HET_HAN'`. Nếu có 100 items hết hạn → 100 subqueries. Với dữ liệu lớn đây là N+1 query pattern.

**Impact:**  
Performance degradation tuyến tính với số lượng thực phẩm hết hạn. Dashboard báo cáo sẽ chậm.

**Recommended fix:**  
Dùng `OUTER APPLY` hoặc CTE để join một lần thay vì correlated subquery.

**Confidence:** High

---

### BUG-022

**Severity:** Medium (7)  
**Category:** Logic — Concurrency / Stale Cache  

**Files involved:**
- `backend/src/modules/admin/admin.repository.ts` (Lines 5–42)

**Root cause:**  
`AdminRepository` dùng instance-level cache (`this.cachedStats`) với TTL 5 phút. Tuy nhiên, mỗi request tạo instance `AdminRepository` mới (trong `AdminService` constructor → `new AdminRepository()`). Cache không được chia sẻ giữa requests — cache instance bị hủy sau mỗi request. Cache vô dụng.

```typescript
export class AdminService {
  private repo = new AdminRepository(); // ← new instance mỗi khi service được instantiate
```

**Impact:**  
Cache không hoạt động → mỗi dashboard request đều chạy 7 COUNT queries. Không gây bug logic nhưng là performance issue.

**Recommended fix:**  
Dùng module-level singleton hoặc Redis cache, không phải instance-level.

**Confidence:** High

---

### BUG-023

**Severity:** Medium (6)  
**Category:** Frontend — UI Bug / Missing State  

**Files involved:**
- `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` (Lines 33–34)

**Root cause:**  
`mapList` chuyển `TrangThai` thành lowercase: `(raw.TrangThai || "DANG_TAO").toLowerCase()`. Sau đó check `list.status === "hoan_thanh"` (Lines 34, 470, 574, 584, 587). Nhưng backend trả về `TrangThai = "HOAN_THANH"` → lowercase = `"hoan_thanh"` → match đúng.

Tuy nhiên, Line 34 check `raw.TrangThai === "HOAN_THANH"` (uppercase) cho emoji, còn Line 470 check `list.status === "hoan_thanh"` (lowercase). Không nhất quán → có thể gây mismatch nếu data từ backend thay đổi format.

Ngoài ra, backend `TrangThai` chỉ có `'DANG_TAO'` và `'COMPLETED'` (từ code shopping service), nhưng frontend check `"HOAN_THANH"` và `"hoan_thanh"`.

**Impact:**  
Status badges hiển thị sai. "Hoàn thành & Nhập kho" button có thể không ẩn khi list đã hoàn thành.

**Recommended fix:**  
Đồng bộ status enum: `DANG_TAO | COMPLETED` hoặc `DANG_TAO | HOAN_THANH`. Dùng constant thay vì string literals.

**Confidence:** Medium

---

### BUG-024

**Severity:** Medium (6)  
**Category:** Logic — Edge Case  

**Files involved:**
- `backend/src/modules/meal-plan/meal-plan.repository.ts` (Lines 129–149)

**Root cause:**  
`copyMeals` INSERT vào `KeHoachBuaAn` mà không kiểm tra **duplicate**. Nếu ngày đích đã có kế hoạch cho cùng `Buoi` + `MaMon`, sẽ tạo duplicate. `checkDuplicateMeal` chỉ được gọi trong `create`, không trong `copyMeals`.

**Impact:**  
Sau khi copy, cùng một bữa ăn xuất hiện 2 lần trong ngày. Frontend sẽ hiển thị duplicate entries.

**Recommended fix:**  
Trước khi INSERT trong `copyMeals`, kiểm tra duplicate hoặc dùng `MERGE` SQL statement.

**Confidence:** High

---

### BUG-025

**Severity:** Medium (6)  
**Category:** API — Missing Endpoint  

**Files involved:**
- `frontend/src/app/services/api.ts` (Lines 395–398)
- `backend/src/modules/family/family.route.ts` (not read, inferred)

**Root cause:**  
Frontend `familyApi.updateMemberRole` gọi `PATCH /family/:groupId/members/:userId/role` với body `{ role }`. Nếu backend route không có Zod validation trên `role` value, attacker có thể set role thành `'LEADER'` không qua `transferLeadership` flow → bypass kiểm tra trưởng nhóm hiện tại.

**Impact:**  
Thành viên có thể tự nâng role lên LEADER mà không cần LEADER hiện tại confirm.

**Recommended fix:**  
Cần verify `updateMemberRole` endpoint có kiểm tra quyền và không cho phép set `LEADER` trực tiếp.

**Confidence:** Medium

---

### BUG-026

**Severity:** Medium (6)  
**Category:** Frontend — Logic Bug  

**Files involved:**
- `frontend/src/app/context/AuthContext.tsx` (Lines 42–45)

**Root cause:**  
`persistAuth` đọc `groupId` từ nhiều sources theo thứ tự: `u?.MaNhom ?? u?.groupId ?? u?.maNhom ?? Number(localStorage.getItem('groupId')) ?? null`. Nếu tất cả đều `null/undefined` (user mới chưa có nhóm) nhưng `localStorage` có `groupId` cũ từ phiên trước → user mới được gán `groupId` cũ không đúng.

**Impact:**  
Khi user logout và login bằng tài khoản khác, groupId cũ vẫn tồn tại trong localStorage → user mới thấy dữ liệu của nhóm cũ (nếu họ là thành viên, nếu không là 403 error).

**Recommended fix:**  
Trong `logout`, xóa `groupId` khỏi localStorage (đã làm). Nhưng trong `persistAuth`, không fallback về `localStorage.getItem('groupId')` khi có user mới login.

**Confidence:** Medium

---

### BUG-027

**Severity:** Medium (5)  
**Category:** Database — Missing Transaction  

**Files involved:**
- `backend/src/modules/reports/reports.repository.ts` (Lines 94–107)

**Root cause:**  
`getSummary` chạy 3 queries song song bằng `Promise.all()` — tuy nhiên mỗi query dùng **request object riêng** từ cùng một pool. Trong khi đó, `summaryQuery` và `trendQuery` được tạo từ `request` object khác nhau nhưng cùng parameter `'g'` cho `groupId`. Nếu có conflict parameter name trong mssql request, có thể gây error.

Cụ thể: `summaryQuery` dùng `request` object (Lines 16–28) với `input('g')`, `input('tz')`, `input('startDate')`, `input('endDate')`. Nhưng `trendQuery` cũng dùng pool.request() mới với `input('g')`, `input('tz')`, `input('startDate')`, `input('endDate')` (Lines 96–101) — **truyền `startDate` và `endDate` ngay cả khi undefined** → mssql có thể throw error.

**Impact:**  
Reports page có thể crash khi không có filter (startDate/endDate là undefined).

**Recommended fix:**  
Chỉ bind input khi giá trị không phải undefined/null.

**Confidence:** Medium

---

### BUG-028

**Severity:** Medium (5)  
**Category:** Security — CORS Misconfiguration  

**Files involved:**
- `backend/src/app.ts` (Lines 10–13)

**Root cause:**  
CORS chỉ cho phép `env.CLIENT_URL`. Không có `credentials: true` validation phía client một cách explicit. Tuy nhiên, nếu `CLIENT_URL` được set sai hoặc là wildcard trong `.env` → toàn bộ CORS protection bị bypas.

Không thể verify vì không có `.env` file, nhưng đây là configuration risk.

**Confidence:** Low

---

### BUG-029

**Severity:** Medium (5)  
**Category:** Logic — Email Validation  

**Files involved:**
- `backend/src/modules/users/users.service.ts` (Lines 28–31)

**Root cause:**  
Email validation trong `updateProfile` chỉ check `dto.email.includes('@')`. Điều này chấp nhận `@`, `a@`, `@b`, `test@@test.com` đều là hợp lệ.

**Impact:**  
Email không hợp lệ có thể được lưu vào DB, gây lỗi khi hệ thống gửi email (nếu có).

**Recommended fix:**  
Dùng regex chuẩn hoặc Zod email validator.

**Confidence:** High

---

### BUG-030

**Severity:** Medium (5)  
**Category:** Frontend — XSS Risk  

**Files involved:**
- `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` (Lines 307–350)

**Root cause:**  
`handleExportPDF` dùng `window.open()` và `printWindow.document.write()` để tạo HTML từ dữ liệu user (`item.name`, `selectedList.name`). Dữ liệu được inject trực tiếp vào HTML string mà không được escape:

```typescript
<td style="padding: 8px;">${item.name}</td>  // ← Không escape
```

Nếu `item.name` chứa `<script>alert(1)</script>`, sẽ được execute trong popup window.

**Impact:**  
Stored XSS trong popup PDF. Mức độ thấp vì chỉ ảnh hưởng user tự tạo data của mình.

**Recommended fix:**  
Escape HTML trước khi inject vào `document.write()`. Dùng `DOMPurify` hoặc custom HTML escape function.

**Confidence:** High

---

### BUG-041

**Severity:** Medium (7)  
**Category:** Frontend / API — Business Logic Inconsistency  

**Files involved:**
- `frontend/src/app/components/common/AddShoppingItemModal.tsx`
- `frontend/src/app/components/common/EditShoppingItemModal.tsx`
- `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` (Lines 216–223, 239–244)

**Root cause:**  
Có sự không đồng bộ nghiêm trọng về cấu trúc trường dữ liệu giữa giao diện và cuộc gọi API:
1. `AddShoppingItemModal.tsx` hoàn toàn không có ô nhập liệu cho "GiaDuKien" (giá dự kiến), làm cho trường `price` gửi lên từ modal luôn là `undefined`, dẫn đến `giaDuKien` bị lưu mặc định là `0` khi gọi `apiAddItem`. Ngoài ra modal này có trường `note` (ghi chú) nhưng hàm `handleAddItem` lại bỏ qua, không gửi nó xuống API.
2. `EditShoppingItemModal.tsx` hiển thị các ô cấu hình `emoji`, `category` (danh mục) và `assignee` (người phụ trách), nhưng hàm `handleEditItem` của `ShoppingList.tsx` khi gọi API cập nhật đã bỏ qua hoàn toàn các trường này.
3. Không có bất kỳ thành phần giao diện nào cho phép cập nhật `GiaThucTe` (giá thực tế) khi người dùng tích chọn đã mua hàng, khiến giá trị này mãi bằng `0` trong cơ sở dữ liệu và làm sai lệch nghiêm trọng các báo cáo chi tiêu tài chính thực tế.

**Reproduction:**
1. Thêm một mặt hàng vào danh sách đi chợ, không thể nhập giá dự kiến nên mặt hàng luôn hiển thị `0₫`.
2. Chỉnh sửa một mặt hàng đã có, thay đổi người phụ trách hoặc danh mục, lưu lại và tải lại trang. Các thông tin này sẽ không được cập nhật.

**Impact:**  
Ước tính chi phí đi chợ bị sai lệch, thông tin phân công và phân loại mặt hàng không thể cập nhật thực tế, và báo cáo tài chính gia đình hoàn toàn vô tác dụng do giá thực tế luôn bằng 0.

**Recommended fix:**  
Bổ sung trường nhập giá dự kiến vào `AddShoppingItemModal.tsx`. Cập nhật các payload gửi đi trong `handleAddItem` và `handleEditItem` để chuyển đầy đủ các trường `note`, `category`, `assignee` và `emoji` tương ứng. Thêm ô nhập giá thực tế khi đánh dấu đã mua hoặc trong modal chi tiết/chỉnh sửa.

**Confidence:** High

---

### BUG-042

**Severity:** Medium (6)  
**Category:** Frontend — Mocked Feature  

**Files involved:**
- `frontend/src/app/pages/Settings/Settings.tsx` (Line 448)
- `frontend/src/app/services/api.ts`

**Root cause:**  
Phía backend đã hoàn thiện đầy đủ các API hỗ trợ kích hoạt và cấu hình xác thực 2 bước (2FA) qua mã TOTP (các endpoint `/2fa/setup`, `/2fa/enable`, `/2fa/disable`). Tuy nhiên, `usersApi` trong `api.ts` phía client hoàn toàn chưa khai báo các API này, và nút "Xác thực 2 bước" trong `Settings.tsx` chỉ hiển thị thông báo mockup "Tính năng đang cập nhật...".

**Reproduction:**
1. Truy cập trang "Cài đặt" -> Bảo mật.
2. Bấm vào nút "Xác thực 2 bước".
3. Nhận được toast thông báo "Xác thực 2 bước sẽ sớm ra mắt" mà không có luồng thiết lập QR Code hay xác minh mã OTP thực tế.

**Impact:**  
Người dùng không thể tăng cường bảo mật cho tài khoản của họ bằng cơ chế 2FA mặc dù tính năng này đã được phát triển ở backend.

**Recommended fix:**  
Khai báo các API 2FA trong `api.ts`, thiết kế modal quét mã QR cùng ô xác thực mã OTP 6 số để hoàn thành quy trình kích hoạt/hủy kích hoạt 2FA trên giao diện `Settings.tsx`.

**Confidence:** High

---

### BUG-043

**Severity:** Medium (6)  
**Category:** Frontend — Mocked Feature / Broken Event Handler  

**Files involved:**
- `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` (Line 722)
- `frontend/src/app/pages/Inventory/Inventory.tsx` (Line 875)

**Root cause:**  
Hộp thoại lọc dữ liệu (`FilterModal`) trong cả hai trang Shopping List và Inventory được khởi tạo với sự kiện `onApply={() => setShowFilter(false)}`. Điều này khiến các lựa chọn lọc của người dùng bị vứt bỏ hoàn toàn ngay khi đóng modal thay vì được truyền ra ngoài để cập nhật danh sách hiển thị hoặc gửi lên query API.

**Reproduction:**
1. Vào trang Kho thực phẩm hoặc Danh sách đi chợ.
2. Bấm vào biểu tượng phễu lọc để mở `FilterModal`, chọn một bộ lọc (ví dụ: chỉ hiện rau củ, hoặc chỉ hiện đồ sắp hết hạn) và bấm "Áp dụng".
3. Modal đóng lại nhưng danh sách hiển thị không hề thay đổi.

**Impact:**  
Tính năng lọc danh sách mua sắm và kho thực phẩm bị tê liệt hoàn toàn, gây khó khăn cho các gia đình có lượng dữ liệu lớn muốn tìm kiếm và phân loại thực phẩm.

**Recommended fix:**  
Định nghĩa hàm callback xử lý bộ lọc trong `ShoppingList.tsx` và `Inventory.tsx` (ví dụ `handleApplyFilters`), lưu trạng thái bộ lọc vào state và truyền hàm này vào prop `onApply` của `FilterModal`.

**Confidence:** High

---

## 🟢 LOW (Severity 1–4)

---

### BUG-031

**Severity:** Low (4)  
**Category:** Performance — Unnecessary Re-render  

**Files involved:**
- `frontend/src/app/pages/ShoppingList/ShoppingList.tsx` (Lines 146–150)

**Root cause:**  
Auto-select logic check `!selectedListId` nhưng khi list thay đổi sau delete, `selectedListId` vẫn giữ giá trị cũ không tồn tại → list không được auto-select.

**Impact:**  
Sau khi xóa list đang chọn, UI không tự chuyển sang list tiếp theo.

**Confidence:** Medium

---

### BUG-032

**Severity:** Low (4)  
**Category:** Logic — Dead Code  

**Files involved:**
- `backend/src/core/utils/jwt.ts` (Lines 4–8)

**Root cause:**  
`generateToken` là function deprecated — không được dùng ở đâu cả. `generateAccessToken` và `generateRefreshToken` đã thay thế. Dead code gây confuse.

**Confidence:** High

---

### BUG-033

**Severity:** Low (4)  
**Category:** Logic — Missing Validation  

**Files involved:**
- `backend/src/modules/meal-plan/meal-plan.validation.ts` (Line 16)

**Root cause:**  
`buoi` chỉ accept `['SANG', 'TRUA', 'TOI']` nhưng schema DB (`AGENTS.md`) nói `Buoi` field cũng có thể có `'PHU'` (Phụ). Frontend có thể muốn support bữa phụ nhưng validation reject nó.

**Confidence:** Medium

---

### BUG-034

**Severity:** Low (3)  
**Category:** Frontend — Missing Error State  

**Files involved:**
- `frontend/src/app/hooks/useData.ts` (Lines 27–31, 68–73, etc.)

**Root cause:**  
Hầu hết các hooks (`useInventory`, `useShopping`, `useMealPlan`, `useRecipes`) catch lỗi bằng `console.error` và **không set error state**. UI không hiển thị error state — user không biết data load thất bại.

**Impact:**  
User thấy màn hình trống không có explanation khi API fail.

**Recommended fix:**  
Thêm `error` state vào các hooks và hiển thị error UI.

**Confidence:** High

---

### BUG-035

**Severity:** Low (3)  
**Category:** Logic — Missing Pagination  

**Files involved:**
- `backend/src/modules/admin/admin.repository.ts` (Lines 44–54)
- `backend/src/modules/admin/admin.repository.ts` (Lines 101–117)

**Root cause:**  
`getAllUsers()` và `getAuditLogs()` không có pagination — SELECT tất cả records. Với hàng nghìn users hoặc logs, response sẽ rất lớn.

**Confidence:** High

---

### BUG-036

**Severity:** Low (3)  
**Category:** Test Coverage — Zero Tests  

**Files involved:**
- `tests/api/` (empty)
- `tests/sql/` (empty)

**Root cause:**  
Không có bất kỳ test nào — unit test, integration test, hay E2E test. Critical paths như auth flow, shopping completion, inventory deduction hoàn toàn không được test tự động.

**Impact:**  
Mọi regression có thể không bị phát hiện. CI/CD không thể chạy.

**Confidence:** High

---

### BUG-037

**Severity:** Low (2)  
**Category:** Logic — Inconsistent Status Enum  

**Files involved:**
- `backend/src/modules/admin/admin.repository.ts` (Lines 19, 25, 50, 73–78)

**Root cause:**  
`getDashboardStats` filter `TrangThai != 'DELETED'` nhưng schema chỉ có `'ACTIVE'` và `'LOCKED'`. Tuy nhiên `deleteUser` set `TrangThai = 'DELETED'` — schema violation. Soft delete dùng trạng thái không có trong schema chính thức.

**Confidence:** High

---

### BUG-038

**Severity:** Low (2)  
**Category:** Security — Rate Limiting Absent  

**Files involved:**
- `backend/src/modules/auth/auth.route.ts` (inferred)
- `backend/src/app.ts`

**Root cause:**  
Không có rate limiting trên endpoint login/register. Attacker có thể brute-force mật khẩu không giới hạn.

**Recommended fix:**  
Thêm `express-rate-limit` cho `/auth/login` và `/auth/register`.

**Confidence:** High

---

### BUG-044

**Severity:** Low (4)  
**Category:** Frontend — Dead Code  

**Files involved:**
- `frontend/src/app/components/common/ImportRecipeModal.tsx`
- `frontend/src/app/components/common/TransferInventoryModal.tsx`
- `frontend/src/app/components/common/ViewStatDetailsModal.tsx`
- `frontend/src/app/components/common/ViewDetailsModal.tsx`
- `frontend/src/app/components/common/index.ts`

**Root cause:**  
Các tệp modal này đã được xây dựng và xuất (export) ở file `index.ts` của thư mục components/common nhưng hoàn toàn không được import hay sử dụng ở bất kỳ trang giao diện nào trong mã nguồn dự án.

**Impact:**  
Gây dư thừa mã nguồn, tăng kích thước gói build của frontend một cách không cần thiết và tạo sự mơ hồ khi bảo trì code.

**Recommended fix:**  
Xóa bỏ các tệp thành phần không sử dụng này và loại bỏ chúng khỏi danh sách export ở `index.ts`, hoặc tích hợp chúng vào các trang tính năng tương ứng nếu có kế hoạch sử dụng trong tương lai gần.

**Confidence:** High

---

### BUG-045

**Severity:** Low (4)  
**Category:** Frontend — Mocked Feature  

**Files involved:**
- `frontend/src/app/components/common/ViewRecipeModal.tsx` (Lines 147–168)

**Root cause:**  
Trong hộp thoại xem chi tiết công thức (`ViewRecipeModal.tsx`), ba nút chức năng gồm "Yêu thích", "Chia sẻ", và "In" chỉ mang tính chất minh họa về mặt giao diện, hoàn toàn không được gán sự kiện `onClick` hoặc các thuộc tính logic để thực hiện chức năng tương ứng.

**Reproduction:**
1. Mở xem chi tiết bất kỳ công thức nấu ăn nào.
2. Bấm vào các nút "Yêu thích", "Chia sẻ" hoặc "In".
3. Không có bất kỳ phản hồi hay hành động nào xảy ra.

**Impact:**  
Làm giảm trải nghiệm người dùng, tạo cảm giác tính năng chưa hoàn thiện.

**Recommended fix:**  
Bổ sung các hàm xử lý sự kiện thích hợp: dùng Web Share API cho "Chia sẻ", `window.print` cho "In", và kết nối API lưu trữ yêu thích cho nút "Yêu thích".

**Confidence:** High

---

### BUG-046

**Severity:** Low (4)  
**Category:** Frontend — Mocked Feature / Broken Event Handler  

**Files involved:**
- `frontend/src/app/components/common/ViewInventoryDetailsModal.tsx` (Lines 91–106)
- `frontend/src/app/pages/Inventory/Inventory.tsx` (Line 882)

**Root cause:**  
1. Trong `ViewInventoryDetailsModal.tsx`, phần "Lịch sử lưu trữ" chứa các dòng lịch sử tĩnh và cố định ("14/04/2026 Thêm vào kho", "15/04/2026 Chuyển vị trí") cho tất cả các loại thực phẩm, thay vì truy vấn lịch sử thực tế từ bảng `NhatKyKho`.
2. Trong `Inventory.tsx`, thuộc tính `onEdit` truyền vào `ViewInventoryDetailsModal` chỉ đơn thuần đóng modal lại (`setViewItem(null)`) mà không kích hoạt hộp thoại chỉnh sửa thực phẩm.

**Reproduction:**
1. Mở xem chi tiết của hai loại thực phẩm khác nhau trong kho. Cả hai đều hiển thị cùng một lịch sử lưu trữ tĩnh giống hệt nhau.
2. Bấm nút "Chỉnh sửa" trong hộp thoại chi tiết thực phẩm. Hộp thoại đóng lại nhưng không có màn hình chỉnh sửa nào hiện ra.

**Impact:**  
Người dùng không thể xem được vết biến động thực tế của lô hàng và luồng chỉnh sửa thực phẩm từ màn hình chi tiết bị đứt gãy.

**Recommended fix:**  
Truy vấn dữ liệu nhật ký kho thật sự dựa trên `MaTP` để hiển thị trong mục lịch sử. Cấu hình callback `onEdit` trong `Inventory.tsx` để mở modal chỉnh sửa thực phẩm thay vì chỉ đóng modal hiện tại.

**Confidence:** High

---

### BUG-047

**Severity:** Low (4)  
**Category:** Frontend — Mocked Feature  

**Files involved:**
- `frontend/src/app/pages/Admin/Users/Users.tsx` (Lines 135–137, 140–142)

**Root cause:**  
Trang quản lý người dùng của Admin chứa hai tính năng giả lập (mock):
1. Khi bấm "Thêm người dùng" và submit biểu mẫu, hàm `handleSave` chỉ đưa ra thông báo cảnh báo quản trị viên tự đăng ký qua luồng công cộng mà không thực hiện gọi API thêm mới thành viên.
2. Khi bấm "Reset mật khẩu", hệ thống ngay lập tức kích hoạt toast thông báo gửi email thành công mà không hề thực hiện bất kỳ yêu cầu mạng nào tới backend.

**Reproduction:**
1. Vào trang Admin -> Quản lý người dùng.
2. Thực hiện thêm mới người dùng hoặc bấm chọn Reset mật khẩu của một tài khoản.
3. Nhận được các toast thông báo thành công hoặc chỉ dẫn, nhưng kiểm tra Network Tab không có request nào được gửi, và không có thực tế thay đổi nào được lưu.

**Impact:**  
Quản trị viên không thể tạo người dùng trực tiếp hoặc thực hiện reset mật khẩu cho các thành viên, làm giảm hiệu năng quản trị hệ thống.

**Recommended fix:**  
Bổ sung các API hỗ trợ tạo người dùng bởi admin và gửi email reset mật khẩu từ backend, liên kết các API này vào giao diện điều khiển tương ứng.

**Confidence:** High

---

## Phụ lục — Cross-File Consistency Issues

| # | Frontend | Backend | Mismatch |
|---|----------|---------|---------|
| 1 | `inventoryApi.getLogs(groupId)` → `?groupId=X` query | Route `/:groupId/logs` → params | **BUG-010**: Method mismatch |
| 2 | Shopping status check `"hoan_thanh"` | Backend enum `COMPLETED`/`HOAN_THANH` | **BUG-023**: Status inconsistency |
| 3 | `getStats()` calls `countByStatus('BANNED')` | DB schema chỉ có `ACTIVE`/`LOCKED` | **BUG-008**: Enum mismatch |
| 4 | `deductInventoryForCooking` sets `'HET'` | DB schema chỉ có `'CON_HAN'`/`'HET_HAN'` | **BUG-013**: Status mismatch |
| 5 | `updatePassword` không set `MatKhauNgayCapNhat` | `authenticate` middleware check field này | **BUG-004**: Token invalidation broken |
| 6 | `familyApi.updateMember` & `updateMemberRole` | Không định nghĩa các API route tương ứng | **BUG-039**: Unimplemented API routes |
| 7 | Shopping List updates (`ShoppingList.tsx` updates) | Payload gửi đi thiếu/bỏ qua các trường giao diện | **BUG-041**: Ignored fields in item payload |
| 8 | Settings 2FA button is static mock | `auth.route.ts` has fully implemented 2FA routes | **BUG-042**: 2FA frontend mocked |

---

## Phụ lục — Security Summary (OWASP Top 10 Mapping)

| OWASP Category | Bug IDs | Status |
|----------------|---------|--------|
| A01 Broken Access Control | BUG-001, BUG-002, BUG-007, BUG-025 | 🔴 Critical |
| A02 Cryptographic Failures | BUG-003 (token storage) | 🔴 Critical |
| A03 Injection | ✅ Parameterized queries dùng tốt | ✅ Protected |
| A04 Insecure Design | BUG-005, BUG-004 | 🔴 Critical |
| A05 Security Misconfiguration | BUG-001, BUG-002, BUG-028 | 🟠 High |
| A06 Vulnerable Components | Chưa audit dependencies | ⚠️ Unknown |
| A07 Auth Failures | BUG-004, BUG-008, BUG-012, BUG-038, BUG-042, BUG-047 | 🟠 High |
| A08 Software Integrity | N/A (không có supply chain) | N/A |
| A09 Logging Failures | BUG-006 (stack trace leak) | 🟠 High |
| A10 SSRF | Không phát hiện | ✅ OK |
| XSS | BUG-030 (PDF export) | 🟡 Medium |

---

*Báo cáo này được tạo dựa trên phân tích tĩnh (static analysis) và đánh giá logic nghiệp vụ. Không có thay đổi code nào được thực hiện.*
