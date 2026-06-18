# 📚 Knowledge Base — Nateat Shopping Convenience System

> **Phiên bản:** 1.0 | **Ngày cập nhật:** 2026-06-18
> Tài liệu tổng hợp **toàn bộ kiến thức kỹ thuật** của dự án, phục vụ onboarding, phát triển tính năng mới, debugging và kiểm thử.

---

## 📋 Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack chi tiết](#2-tech-stack-chi-tiết)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Cơ sở dữ liệu](#5-cơ-sở-dữ-liệu)
6. [Backend — API Endpoints](#6-backend--api-endpoints)
7. [Backend — Patterns & Conventions](#7-backend--patterns--conventions)
8. [Frontend — Routing & Pages](#8-frontend--routing--pages)
9. [Frontend — State Management](#9-frontend--state-management)
10. [Frontend — Hooks & Services](#10-frontend--hooks--services)
11. [Luồng xác thực (Auth Flow)](#11-luồng-xác-thực-auth-flow)
12. [Tài khoản mặc định](#12-tài-khoản-mặc-định)
13. [Cấu hình môi trường](#13-cấu-hình-môi-trường)
14. [Quy ước & Coding Standards](#14-quy-ước--coding-standards)

---

## 1. Tổng quan dự án

| Thuộc tính | Giá trị |
|---|---|
| **Tên dự án** | Nateat — Hệ thống Đi Chợ và Quản lý Kho Thực Phẩm |
| **Mục tiêu** | Hỗ trợ hộ gia đình lập kế hoạch bữa ăn, quản lý kho tủ lạnh, tự động hóa danh sách đi chợ |
| **Đối tượng** | Hộ gia đình, nhóm sống chung cần đồng bộ hóa mua sắm và quản lý thực phẩm |
| **Trạng thái** | Build thành công, kết nối CSDL hoạt động, 32 lỗi logic nghiệp vụ đã ghi nhận tại `BaoCaoLoiHeThong.md` |
| **Môi trường** | Localhost (Development) |
| **URL Frontend** | http://localhost:5173 |
| **URL Backend** | http://localhost:5000 |
| **API Base** | http://localhost:5000/api/v1 |

### Tính năng chính

| Module | Mô tả |
|---|---|
| **Dashboard** | Tổng quan hạn dùng thực phẩm, bữa ăn hôm nay, chi tiêu tuần, lối tắt nhanh |
| **Shopping List** | Danh sách mua sắm gia đình, phân chia người phụ trách, ghi nhận giá dự kiến/thực tế |
| **Inventory** | Theo dõi số lượng, vị trí lưu trữ (Fridge/Freezer/Pantry), hạn sử dụng từng lô |
| **Meal Plan** | Lịch ăn theo ngày và buổi (Sáng/Trưa/Tối/Phụ), kiểm tra nguyên liệu thiếu |
| **Recipes** | Công thức nấu ăn công khai (hệ thống) và riêng tư (gia đình) |
| **Reports** | Thống kê chi tiêu thực tế, lãng phí, năng lượng tiêu thụ dạng biểu đồ |
| **Family Members** | Quản lý nhóm gia đình qua mã mời bảo mật, phân quyền LEADER/MEMBER/VIEWER |
| **Admin Control** | Giám sát users, master data, audit logs, thống kê vận hành thực tế |

---

## 2. Tech Stack chi tiết

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **React** | 18.3.1 | Core UI framework |
| **TypeScript** | 6.0.3 | Type safety |
| **Vite** | 6.4.2 | Build tool & Dev server (port 5173) |
| **React Router** | 7.13.0 | Client-side routing (`createBrowserRouter`) |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS (via `@tailwindcss/vite` plugin) |
| **Radix UI** | Latest | Accessible headless component primitives (30+ packages) |
| **Lucide React** | 0.487.0 | Icon library |
| **Motion** | 12.23.24 | Micro-animations |
| **Recharts** | 2.15.2 | Biểu đồ báo cáo: AreaChart, BarChart, PieChart, LineChart |
| **React Hook Form** | 7.55.0 | Form state management |
| **React DnD** | 16.0.1 | Drag & Drop (meal plan reordering) |
| **React Day Picker** | 8.10.1 | Date picker component |
| **date-fns** | 3.6.0 | Date formatting utilities |
| **class-variance-authority** | 0.7.1 | Component variant management |
| **clsx + tailwind-merge** | Latest | Conditional className merging |
| **canvas-confetti** | 1.9.4 | Hiệu ứng confetti khi hoàn thành |
| **Material UI** | 7.3.5 | Một số component bổ sung |
| **sonner** | 2.0.3 | Toast notifications |

### Backend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Node.js** | v18+ | Runtime |
| **TypeScript** | 6.0.3 | Type safety |
| **Express** | 5.2.1 | Web framework (Promise-based routing) |
| **mssql** | 12.5.0 | Microsoft SQL Server client, Connection Pool |
| **jsonwebtoken** | 9.0.3 | JWT generation & verification |
| **bcryptjs** | 3.0.3 | Password hashing (salt rounds: 10) |
| **Zod** | 4.3.6 | Input validation middleware |
| **dotenv** | 17.4.2 | Environment variables |
| **cors** | 2.8.6 | Cross-Origin Resource Sharing |
| **nodemon** | 3.1.14 | Dev server auto-restart |
| **ts-node** | 10.9.2 | TypeScript direct execution |

> ⚠️ **Lưu ý Express 5**: Dùng native `http` server (`require('http').createServer(app)`) để bọc Express app tránh "clean exit" do cơ chế Promise-based mới của Express 5.

### Database

| Công nghệ | Chi tiết |
|---|---|
| **Engine** | Microsoft SQL Server |
| **Database name** | `shoppingdb` |
| **Port** | 1433 (mặc định) |
| **Client** | `mssql` v12.5.0 với Connection Pool (max 10 connections) |
| **Migration strategy** | Script SQL đánh số thứ tự 01–07 chạy thủ công qua SSMS |
| **Seed data** | `01_seed_master.sql` + `02_seed_bulk.sql` |

---

## 3. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│              React 18 SPA (Vite, port 5173)                 │
│  AuthContext │ AdminContext │ ToastContext │ LanguageContext  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST (Bearer JWT)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER (Express 5)               │
│                        (port 5000)                          │
│                                                             │
│  Route → Middleware → Controller → Service → Repository     │
│                                                             │
│  Middleware stack:                                          │
│  • authenticate  (JWT verify + pwdUpdatedAt cross-check)    │
│  • authorizeRole (ADMIN / MEMBER / VIEWER)                  │
│  • validateRequest (Zod schema validation)                  │
│  • errorMiddleware (centralized error handling)             │
│  • Rate Limiter (in-memory, 5 req/15min cho /auth/login)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ Parameterized Raw SQL
                           │ via Connection Pool
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│            SQL Server (shoppingdb, port 1433)               │
│                                                             │
│  13 Tables  │  2 Views  │  5 Indexes                        │
│  2 Stored Procedures  │  1 Trigger  │  SQL Agent Jobs(TODO) │
└─────────────────────────────────────────────────────────────┘
```

### Luồng xử lý request chuẩn

```
Client
  → Bearer JWT trong Authorization header
  → authenticate middleware (verify token + pwdUpdatedAt)
  → [authorizeRole middleware] (kiểm tra vai trò)
  → [validateRequest middleware] (Zod schema)
  → Controller.method()
  → Service.businessLogic()
  → Repository.rawSqlQuery()
  → SQL Server
  ← Repository trả kết quả
  ← Service ánh xạ/tổng hợp data
  ← Controller gọi createSuccess(res, data)
  ← Client nhận JSON { success: true, data: ... }
```

---

## 4. Cấu trúc thư mục

### Backend (`/backend/src/`)

```
src/
├── config/
│   ├── database.ts      # Connection Pool: max 10, idleTimeout 30s, connectTimeout 15s
│   ├── env.ts           # dotenv loader + typed env object
│   └── logger.ts        # Console logger wrapper
├── core/
│   ├── constants/       # Hằng số toàn hệ thống
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verify + pwdUpdatedAt DB cross-check
│   │   ├── role.middleware.ts      # authorizeRole(['ADMIN', 'MEMBER'])
│   │   ├── validate.middleware.ts  # Zod validateRequest(schema) wrapper
│   │   └── error.middleware.ts     # Centralized error handler
│   └── utils/
│       ├── jwt.ts      # generateAccessToken(15m), generateRefreshToken(7d), verify
│       ├── hash.ts     # hashPassword(bcrypt), comparePassword
│       └── response.ts # createSuccess(res, data), createError(res, msg, code)
├── modules/
│   ├── admin/          # controller, service, repository, route
│   ├── auth/           # controller, service, repository, route, validation(Zod)
│   ├── family/         # controller, service, repository, route
│   ├── inventory/      # controller, service, repository, route
│   ├── meal-plan/      # controller, service, repository, route
│   ├── recipes/        # controller, service, repository, route
│   ├── reports/        # controller, service, repository, route
│   ├── shopping/       # controller, service, repository, route
│   └── users/          # controller, service, repository, route
├── routes/
│   └── index.ts        # Central router gắn tất cả module vào /api/v1/*
├── app.ts              # Express config: CORS, JSON parser, custom cookie parser, routes
└── server.ts           # Native http.createServer() wrapper (Express 5 compatibility fix)
```

### Frontend (`/frontend/src/app/`)

```
app/
├── components/
│   ├── common/          # Modal, Toast, PageHeader, StatCard, FamilyOnboardingPrompt, ...
│   ├── ui/              # Radix UI wrappers (card, badge, button, select, progress, ...)
│   └── figma/           # Component từ Figma design
├── constants/           # App-wide constants, ngôn ngữ
├── context/
│   ├── AuthContext.tsx      # User auth state + groupId + Silent Refresh on F5
│   ├── AdminContext.tsx     # Admin session + users + auditLogs + dashStats + reportsStats
│   ├── ToastContext.tsx     # Global toast: success/error/info/warning
│   └── LanguageContext.tsx  # i18n support
├── hooks/
│   ├── useData.ts       # Tất cả data hooks (xem mục 10)
│   └── useToast.ts      # Toast helper hook
├── layouts/
│   ├── GuestLayout/     # Không cần auth (homepage, landing)
│   ├── AuthLayout/      # Màn hình login/register căn giữa
│   ├── MainLayout/      # Sidebar + nav (yêu cầu auth + groupId)
│   └── AdminLayout/     # Admin sidebar (yêu cầu role ADMIN)
├── pages/
│   ├── Homepage/        # Landing page công khai
│   ├── Auth/            # Login, Register, ForgotPassword
│   ├── Dashboard/       # Tổng quan user: stats, chart chi tiêu, meals, expiry
│   ├── ShoppingList/    # Quản lý danh sách đi chợ
│   ├── Inventory/       # Kho thực phẩm (filter theo Fridge/Freezer/Pantry)
│   ├── MealPlan/        # Lịch bữa ăn tuần
│   ├── Recipes/         # Thư viện công thức nấu ăn
│   ├── Reports/         # Báo cáo tài chính + biểu đồ
│   ├── FamilyMembers/   # Quản lý nhóm + mã mời
│   ├── Settings/        # Profile, đổi mật khẩu, 2FA
│   └── Admin/
│       ├── Dashboard/   # Admin Dashboard (dữ liệu thực từ DB)
│       ├── Users/       # Bảng quản lý user (lock/unlock/delete/reset pw)
│       ├── MasterData/  # Dữ liệu master (công thức hệ thống)
│       ├── AuditLogs/   # Nhật ký hành động admin
│       ├── Reports/     # Báo cáo toàn hệ thống (chi tiêu + lãng phí)
│       └── Settings/    # Cài đặt admin
├── services/
│   └── api.ts           # Fetch client + Concurrent Refresh Token mechanism
├── utils/               # String formatters, avatar position helpers, location parsers
├── styles/
│   └── index.css        # CSS variables hệ thống + Tailwind v4 config
├── App.tsx              # Root component: RouterProvider + context providers wrap
└── routes.tsx           # createBrowserRouter — toàn bộ route config
```

---

## 5. Cơ sở dữ liệu

### Danh sách 13 bảng

| STT | Tên bảng | Mô tả |
|---|---|---|
| 1 | `NguoiDung` | Tài khoản, bcrypt hash, 2FA TOTP secret |
| 2 | `NhomGiaDinh` | Nhóm gia đình, soft delete, max 10 thành viên |
| 3 | `ThanhVienNhom` | Liên kết user–group, vai trò LEADER/MEMBER/VIEWER |
| 4 | `FamilyInvites` | Mã mời bảo mật, MaxUses, ExpiresAt, soft delete |
| 5 | `FamilyNotifications` | Nhật ký sự kiện: JOIN / LEAVE / TRANSFER / INFO_UPDATE |
| 6 | `DanhSachMuaSam` | Phiên đi chợ: DANG\_TAO / COMPLETED |
| 7 | `ChiTietMuaSam` | Mặt hàng: DaMua, GiaDuKien, GiaThucTe, DanhMucHang |
| 8 | `KhoThucPham` | Kho thực phẩm, Version (OCC), Fridge/Freezer/Pantry |
| 9 | `NhatKyKho` | Audit trail biến động kho: THEM\_MOI / CAP\_NHAT / TIEU\_THU / XOA |
| 10 | `MonAn` | Công thức nấu: MaNhom=NULL là public, có MaNhom là private |
| 11 | `NguyenLieuMon` | Định lượng nguyên liệu cho từng công thức |
| 12 | `KeHoachBuaAn` | Lịch ăn: SANG/TRUA/TOI/PHU, TenMonAn dự phòng (backup) |
| 13 | `BaoCaoChiTieu` | Chốt số liệu: `Tuan X - YYYY` hoặc `Thang X - YYYY` |

> Ngoài ra còn bảng `AuditLogs` do Admin module quản lý (không có trong schema chính).

---

### Schema các bảng quan trọng

#### `NguoiDung` — Tài khoản người dùng

```sql
MaNguoiDung          INT          PK IDENTITY
HoTen                NVARCHAR(100) NOT NULL
Email                NVARCHAR(100) UNIQUE NOT NULL
MatKhauHash          NVARCHAR(255) NOT NULL        -- bcrypt, salt 10
SoDienThoai          NVARCHAR(20)  NULL
Bio                  NVARCHAR(500) NULL
VaiTro               NVARCHAR(50)  DEFAULT 'MEMBER' -- 'ADMIN' | 'MEMBER'
TrangThai            NVARCHAR(20)  DEFAULT 'ACTIVE'  -- 'ACTIVE' | 'LOCKED' | 'DELETED'
NgayTao              DATETIME      DEFAULT GETDATE()
NgayCapNhat          DATETIME      DEFAULT GETDATE()
MatKhauNgayCapNhat   DATETIME2     DEFAULT GETUTCDATE() -- dùng vô hiệu hóa token cũ
TwoFactorSecret      NVARCHAR(255) NULL             -- TOTP secret key HMAC-SHA1
IsTwoFactorEnabled   BIT           DEFAULT 0
```

#### `KhoThucPham` — Kho thực phẩm

```sql
MaTP       INT            PK IDENTITY
MaNhom     INT            FK → NhomGiaDinh (CASCADE)
TenTP      NVARCHAR(100)  NOT NULL
SoLuong    DECIMAL(10,2)  NOT NULL  CHECK >= 0
DonVi      NVARCHAR(50)   NULL
HanSuDung  DATE           NULL
ViTri      NVARCHAR(100)  NULL  -- 'Fridge' | 'Freezer' | 'Pantry'
NgayNhap   DATE           DEFAULT CAST(GETDATE() AS DATE)
TrangThai  NVARCHAR(30)   DEFAULT 'CON_HAN'  -- 'CON_HAN' | 'HET_HAN'
Version    INT            DEFAULT 1           -- Optimistic Concurrency Control (OCC)
NgayCapNhat DATETIME      DEFAULT GETDATE()
```

#### `ChiTietMuaSam` — Mặt hàng trong phiên đi chợ

```sql
MaCT           INT             PK IDENTITY
MaDanhSach     INT             FK → DanhSachMuaSam (CASCADE)
TenThucPham    NVARCHAR(100)   NOT NULL
SoLuong        DECIMAL(10,2)   NOT NULL  CHECK > 0
DonVi          NVARCHAR(50)    NULL
NguoiPhuTrach  INT             FK → NguoiDung (SET NULL)
GiaDuKien      DECIMAL(12,2)   DEFAULT 0  CHECK >= 0
GiaThucTe      DECIMAL(12,2)   DEFAULT 0  CHECK >= 0
DaMua          BIT             DEFAULT 0
DanhMucHang    NVARCHAR(50)    NULL   -- 'Thịt' | 'Rau' | 'Hải sản' | 'Gia vị' ...
GhiChu         NVARCHAR(255)   NULL
NgayMua        DATETIME        NULL   -- thời điểm tick DaMua = 1
MaNguoiMua     INT             FK → NguoiDung (NO ACTION)
```

#### `BaoCaoChiTieu` — Báo cáo tài chính

```sql
MaBaoCao    INT             PK IDENTITY
MaNhom      INT             FK → NhomGiaDinh (CASCADE)
TuanThang   NVARCHAR(50)    NULL  -- 'Tuan 23 - 2026' | 'Thang 05 - 2026'
TongChiPhi  DECIMAL(12,2)   DEFAULT 0  CHECK >= 0
TongLangPhi DECIMAL(12,2)   DEFAULT 0  CHECK >= 0
NgayTao     DATETIME        DEFAULT GETDATE()
```

---

### Views

| View | Điều kiện lọc | Mô tả |
|---|---|---|
| `vw_ThucPhamSapHetHan` | HanSuDung BETWEEN today AND today+3, CON_HAN, SoLuong > 0 | Thực phẩm hết hạn trong 3 ngày tới |
| `vw_ThongKeMuaSam` | JOIN DanhSachMuaSam + ChiTietMuaSam | Tổng hóa đơn dự kiến/thực tế và tỷ lệ hoàn thành |

### Stored Procedures

| Procedure | Tham số | Mô tả |
|---|---|---|
| `sp_TaoNhomGiaDinh` | `@TenNhom, @MaNguoiDung, @MaNhomMoi OUTPUT` | Tạo nhóm + thêm người tạo làm LEADER trong 1 transaction |
| `sp_HoanThanhMuaSamKho` | `@MaDanhSach, @MaNhom` | Đẩy tất cả món ĐÃ MUA vào KhoThucPham + set COMPLETED |

### Indexes

```sql
IDX_NguoiDung_Email                  ON NguoiDung(Email)
IDX_KhoThucPham_MaNhom_HanSuDung     ON KhoThucPham(MaNhom, HanSuDung)
IDX_ChiTietMuaSam_MaDanhSach_DaMua   ON ChiTietMuaSam(MaDanhSach, DaMua)
IDX_KeHoachBuaAn_MaNhom_Ngay         ON KeHoachBuaAn(MaNhom, Ngay)
IDX_MonAn_TenMon                     ON MonAn(TenMon)
```

### Trigger

```sql
-- Tự động cập nhật NgayCapNhat mỗi khi UPDATE bảng NguoiDung
trg_NguoiDung_Update  AFTER UPDATE ON NguoiDung
```

### SQL Agent Job (TODO — chưa kích hoạt)

```sql
-- Job: Job_CapNhatThucPhamHetHan
-- Schedule: Mỗi ngày lúc 00:01 AM
-- Action:
UPDATE KhoThucPham
SET TrangThai = 'HET_HAN'
WHERE HanSuDung < CAST(GETDATE() AS DATE)
  AND TrangThai != 'HET_HAN';
```

---

## 6. Backend — API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### `/auth` — Xác thực (Public)

| Method | Endpoint | Rate Limit | Mô tả |
|---|---|---|---|
| `POST` | `/auth/login` | 5 req/15min/IP | Đăng nhập, trả về Access Token + set Refresh Cookie |
| `POST` | `/auth/register` | — | Đăng ký tài khoản |
| `POST` | `/auth/refresh` | — | Làm mới Access Token qua HttpOnly Cookie |
| `POST` | `/auth/logout` | — | Xóa Refresh Token cookie |
| `GET` | `/auth/me` | — | Lấy thông tin user hiện tại (requires JWT) |
| `POST` | `/auth/2fa/setup` | — | Khởi tạo 2FA — trả về secret + QR URL |
| `POST` | `/auth/2fa/enable` | — | Kích hoạt 2FA sau khi user verify TOTP 6 chữ số |
| `POST` | `/auth/2fa/disable` | — | Tắt 2FA |

### `/users` — Hồ sơ cá nhân (Requires JWT)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/users/profile` | Lấy thông tin profile |
| `PUT` | `/users/profile` | Cập nhật HoTen, SoDienThoai, Bio |
| `PUT` | `/users/change-password` | Đổi mật khẩu (vô hiệu hóa token cũ) |

### `/family` — Nhóm gia đình (Requires JWT)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/family/create` | Tạo nhóm gia đình (gọi `sp_TaoNhomGiaDinh`) |
| `GET` | `/family/:groupId` | Thông tin nhóm |
| `GET` | `/family/:groupId/members` | Danh sách thành viên + vai trò |
| `POST` | `/family/join` | Tham gia nhóm qua mã mời |
| `POST` | `/family/:groupId/invite` | Tạo mã mời mới (MaxUses, ExpiresAt) |
| `GET` | `/family/:groupId/invites` | Danh sách mã mời còn hiệu lực |
| `DELETE` | `/family/:groupId/leave` | Rời nhóm |
| `GET` | `/family/:groupId/notifications` | Nhật ký hoạt động nhóm |

### `/shopping` — Đi chợ (Requires JWT)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/shopping/lists/:groupId` | Danh sách phiên đi chợ |
| `POST` | `/shopping/lists` | Tạo phiên đi chợ mới |
| `GET` | `/shopping/lists/:listId/items` | Mặt hàng trong phiên |
| `POST` | `/shopping/lists/:listId/items` | Thêm mặt hàng |
| `PATCH` | `/shopping/items/:itemId` | Cập nhật (toggle DaMua, giá, người phụ trách) |
| `DELETE` | `/shopping/items/:itemId` | Xóa mặt hàng |
| `POST` | `/shopping/lists/:listId/complete` | Hoàn thành phiên (gọi `sp_HoanThanhMuaSamKho`) |

### `/inventory` — Kho thực phẩm (Requires JWT)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/inventory/:groupId` | Toàn bộ kho |
| `GET` | `/inventory/:groupId/expiring` | Thực phẩm sắp hết hạn (≤ 3 ngày) |
| `POST` | `/inventory` | Thêm thực phẩm vào kho |
| `PUT` | `/inventory/:itemId` | Cập nhật (với OCC version check) |
| `DELETE` | `/inventory/:itemId` | Xóa thực phẩm + ghi NhatKyKho |
| `GET` | `/inventory/:groupId/logs` | Nhật ký biến động kho |

### `/recipes` — Công thức nấu ăn (Requires JWT)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/recipes` | Tất cả công thức (public + private của nhóm) |
| `POST` | `/recipes` | Tạo công thức mới |
| `GET` | `/recipes/:id` | Chi tiết công thức + nguyên liệu |
| `PUT` | `/recipes/:id` | Cập nhật công thức |
| `DELETE` | `/recipes/:id` | Xóa công thức |

### `/meal-plan` — Kế hoạch bữa ăn (Requires JWT)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/meal-plan/:groupId` | Kế hoạch bữa ăn theo tuần |
| `POST` | `/meal-plan` | Thêm bữa ăn vào lịch |
| `DELETE` | `/meal-plan/:id` | Xóa bữa ăn khỏi lịch |

### `/reports` — Báo cáo (Requires JWT)

| Method | Endpoint | Query params | Mô tả |
|---|---|---|---|
| `GET` | `/reports/:groupId` | — | Danh sách báo cáo tài chính theo kỳ |
| `GET` | `/reports/:groupId/summary` | `startDate, endDate, tzOffset` | Tổng kết chi tiêu + xu hướng + phân bổ danh mục |

### `/admin` — Quản trị (Requires JWT + Role ADMIN)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/dashboard` | Stats: totalUsers, totalGroups, totalRecipes, totalLists, activeUsers, bannedUsers, newUsersLast24h |
| `GET` | `/admin/reports` | KPIs + trend (tháng) + categoryDistribution + activity (7 ngày) + topFamilies (Top 5) |
| `GET` | `/admin/users` | Danh sách toàn bộ users (giới hạn 500, loại DELETED) |
| `PATCH` | `/admin/users/:id/status` | Cập nhật trạng thái: ACTIVE \| LOCKED |
| `PATCH` | `/admin/users/:id/role` | Cập nhật vai trò: ADMIN \| MEMBER |
| `DELETE` | `/admin/users/:id` | Soft delete (TrangThai = 'DELETED') |
| `POST` | `/admin/users/:id/reset-password` | Tạo mật khẩu tạm thời ngẫu nhiên 10 ký tự |
| `GET` | `/admin/audit-logs` | Nhật ký hệ thống (200 bản ghi gần nhất) |
| `POST` | `/admin/cleanup-fake-users` | Soft delete tài khoản mới trong 24h chưa tham gia nhóm |

---

## 7. Backend — Patterns & Conventions

### Response format chuẩn

```typescript
// Thành công
{ success: true, data: any, message?: string }

// Lỗi
{ success: false, message: string }
```

### JWT — Cơ chế Dual Token

| Token | Thời hạn | Lưu ở đâu | Ký bằng |
|---|---|---|---|
| **Access Token** | 15 phút | Memory (không localStorage) | `JWT_SECRET` |
| **Refresh Token** | 7 ngày | HttpOnly Cookie (JS không đọc được) | `JWT_SECRET + '_refresh'` |

**JWT Payload:**
```typescript
{
  id: number,
  role: string,
  pwdUpdatedAt: number,  // timestamp lúc cấp token
  iat: number,
  exp: number
}
```

### Silent Refresh — Concurrent Refreshing

Khi Access Token hết hạn (401):
```
1. Request đầu tiên → đặt isRefreshing = true → POST /auth/refresh
2. Các request song song khác → subscribe vào refreshSubscribers queue
3. Refresh thành công → onRefreshed(newToken) → unblock tất cả subscribers
4. Refresh thất bại → redirect /auth/login?expired=true
```

### Password Cross-Check Security

Mỗi authenticated request, middleware so sánh:
- `pwdUpdatedAt` trong JWT payload
- `MatKhauNgayCapNhat` trong DB

Nếu DB > token time + 1s → trả về 401 "Mật khẩu đã được thay đổi"

### OCC — Optimistic Concurrency Control

Bảng `KhoThucPham` dùng cột `Version` để chống Dirty Write:

```sql
UPDATE KhoThucPham
SET SoLuong = @newQty, Version = Version + 1, NgayCapNhat = GETDATE()
WHERE MaTP = @id AND Version = @expectedVersion

-- Nếu rowsAffected = 0 → xung đột → trả về 409 Conflict
-- Client phải reload data và thử lại
```

### Soft Delete

| Bảng | Cơ chế |
|---|---|
| `NguoiDung` | `TrangThai = 'DELETED'` |
| `NhomGiaDinh` | `IsDeleted = 1` |
| `FamilyInvites` | `IsDeleted = 1` |

### Rate Limiting (In-memory, không Redis)

```typescript
// Cấu hình login limiter
windowMs: 15 * 60 * 1000  // 15 phút
max: 5                      // 5 lần thử
message: 'Thử lại sau 15 phút'

// Storage: Record<ip, { count, resetTime }> — reset khi server restart
```

### Admin Dashboard Cache

```typescript
// Module-level cache cho getDashboardStats()
let _cachedStats: any = null;
let _cacheExpiry: number = 0;  // 5 phút TTL

// Cache tự động xóa khi:
// - updateUserStatus() → _cachedStats = null
// - deleteUser() → _cachedStats = null
// - cleanupFakeAccounts() → _cachedStats = null
```

### Admin Security Rules

1. Admin **không thể** tự thay đổi status/role/xóa tài khoản của chính mình
2. Admin session tối đa **2 giờ** (chỉ áp dụng trên production, không áp dụng localhost)
3. Mọi hành động Admin **đều ghi vào AuditLogs** (addAuditLog)

### 2FA Engine

Tự phát triển bằng `crypto` native của Node.js:
- Chuẩn: TOTP (Time-based One-Time Password)
- Algorithm: HMAC-SHA1
- Thời gian: 30 giây mỗi OTP
- Digits: 6 chữ số

---

## 8. Frontend — Routing & Pages

### Route map đầy đủ

```
/                       → GuestLayout  → Homepage (landing page)
/auth/login             → AuthLayout   → Login
/auth/register          → AuthLayout   → Register
/auth/forgot-password   → AuthLayout   → ForgotPassword

/app                    → MainLayout   → redirect → /app/dashboard
/app/dashboard          → MainLayout   → Dashboard
/app/shopping-list      → MainLayout   → ShoppingList
/app/inventory          → MainLayout   → Inventory
/app/meal-plan          → MainLayout   → MealPlan
/app/recipes            → MainLayout   → Recipes
/app/reports            → MainLayout   → Reports
/app/family             → MainLayout   → FamilyMembers
/app/settings           → MainLayout   → Settings

/admin/login            → AdminLayout  → AdminLogin
/admin/dashboard        → AdminLayout  → AdminDashboard
/admin/users            → AdminLayout  → Users
/admin/master-data      → AdminLayout  → MasterData
/admin/audit-logs       → AdminLayout  → AuditLogs
/admin/reports          → AdminLayout  → AdminReports
/admin/settings         → AdminLayout  → AdminSettings
```

### Layout Guards

- **MainLayout**: Kiểm tra `isAuthenticated && !isLoading` → redirect `/auth/login?expired=true` nếu chưa đăng nhập
- **AdminLayout**: Kiểm tra `isAdminAuthenticated` (từ `AdminContext`) → redirect `/admin/login` nếu chưa đăng nhập admin

---

## 9. Frontend — State Management

### AuthContext — Người dùng thường

```typescript
interface AuthContextType {
  user: any | null           // Object user từ DB (HoTen, Email, VaiTro, ...)
  isLoading: boolean         // true khi đang xử lý Silent Refresh sau F5
  isAuthenticated: boolean   // !!user && !!getToken() (memory token)
  login(email, password)     // POST /auth/login → persistAuth()
  register(hoTen, email, pw) // POST /auth/register → tự login sau đó
  logout()                   // Xóa memory token + localStorage + state
  setUser(user)              // Cập nhật user state + localStorage
  groupId: number | null     // Mã nhóm gia đình đang sử dụng
  setGroupId(id)             // Cập nhật groupId state + localStorage
}
```

**Persistence strategy:**
| Data | Storage |
|---|---|
| User object | `localStorage['user']` |
| Group ID | `localStorage['groupId']` |
| Access Token | Memory (`memoryToken` variable) — KHÔNG lưu localStorage |
| Refresh Token | HttpOnly Cookie (Server set, JS không đọc được) |
| Admin session | `localStorage['admin_session']` |

### AdminContext — Quản trị viên

```typescript
interface AdminContextType {
  adminUser: AdminSession | null   // { id, name, email, role }
  isAdminAuthenticated: boolean
  loginAdmin(email, password)      // POST /auth/login, kiểm tra VaiTro === 'ADMIN'
  logoutAdmin()                    // Xóa token + admin_session

  users: AdminUser[]               // Danh sách users từ /admin/users
  auditLogs: AuditLog[]            // Nhật ký từ /admin/audit-logs
  dashStats: {                     // Từ /admin/dashboard
    totalUsers, totalGroups,
    totalRecipes, totalLists,
    activeUsers, bannedUsers,
    newUsersLast24h
  }
  reportsStats: {                  // Từ /admin/reports
    kpis,                          // totalSystemSpend, totalSystemWaste, totalUsers, totalGroups
    trend,                         // Array { label, spend, waste } theo tháng
    categoryDistribution,          // Array { name, value } theo danh mục
    activity,                      // Array 7 ngày { day, new, active }
    topFamilies                    // Top 5 { name, memberCount, totalSpend, completedLists }
  }
  loading: boolean
  reload()                         // Gọi lại toàn bộ Promise.all([users, stats, logs, reports])
  cleanupFakeUsers()               // POST /admin/cleanup-fake-users
}
```

### ToastContext

```typescript
interface ToastContextType {
  success(title, message?)
  error(title, message?)
  info(title, message?)
  warning(title, message?)
}
// Sử dụng: const { success, error } = useToastContext();
// Hoặc: import { toast } from '../../components/common/Toast'
//        toast.success('...') / toast.error('...')
```

---

## 10. Frontend — Hooks & Services

### Custom Hooks (`hooks/useData.ts`)

```typescript
// Dashboard — stats tổng hợp
useDashboardStats() → {
  stats: {
    inventoryCount: number,     // Tổng thực phẩm trong kho
    expiringCount: number,      // Thực phẩm sắp hết hạn
    shoppingListCount: number,  // Tổng mặt hàng trong danh sách
    shoppingDoneCount: number,  // Đã mua
    totalSpend: number,         // Chi tiêu tháng này
    expenseTrend: any[],        // Biểu đồ chi tiêu theo ngày
    categorySpend: any[]        // Phân bổ theo danh mục
  },
  loading, reload
}

// Kho thực phẩm
useInventory(groupId) → { items, expiring, loading, reload, addItem, updateItem, deleteItem }

// Danh sách đi chợ
useShoppingList(groupId) → { lists, loading, reload, createList, addItem, updateItem, deleteItem, completeList }

// Kế hoạch bữa ăn
useMealPlan(groupId) → { meals, todayMeals, loading, loadToday, addMeal, deleteMeal }

// Công thức nấu ăn
useRecipes(groupId?) → { recipes, loading, reload, createRecipe, updateRecipe, deleteRecipe }

// Báo cáo tài chính
useReports(groupId) → { reports, summary, loading, reload, applyFilters, filters }

// Thành viên nhóm
useFamilyMembers(groupId) → { members, invites, notifications, loading, reload, createInvite, removeMember }
```

### API Service (`services/api.ts`)

```typescript
// Cấu hình
BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Token helpers (memory-only, không persist)
getToken() / setToken(t) / removeToken()

// User persistence (localStorage)
getUser() / setUser(u) / removeUser()

// API client objects
authApi    → login, register, refresh, logout, me, setup2FA, enable2FA, disable2FA
userApi    → getProfile, updateProfile, changePassword
familyApi  → create, getInfo, getMembers, join, createInvite, getInvites, leave, getNotifications
shoppingApi → getLists, createList, getItems, addItem, updateItem, deleteItem, completeList
inventoryApi → getAll, getExpiring, add, update, delete, getLogs
recipesApi   → getAll, create, getById, update, delete
mealPlanApi  → getWeekly, add, delete
reportsApi   → getAll, getSummary
adminApi     → getDashboard, getReports, getUsers, updateStatus, updateRole, deleteUser,
               getAuditLogs, cleanupFakeUsers, resetPassword
```

---

## 11. Luồng xác thực (Auth Flow)

### Đăng nhập thông thường

```
1. User nhập email + password → POST /auth/login
2. Server: bcrypt.compare(password, MatKhauHash)
3. Tạo Access Token (15 phút, JWT_SECRET)
4. Tạo Refresh Token (7 ngày, JWT_SECRET + '_refresh')
5. Set-Cookie: refreshToken=...; HttpOnly; SameSite=Strict
6. Response body: { token: accessToken, user: {...} }
7. Client: setToken(accessToken) vào memory
8. Client: setUser(user) vào localStorage
9. Client: setGroupId(user.MaNhom) vào localStorage
```

### Silent Refresh khi tải lại trang (F5)

```
1. AuthContext mount → initAuth() chạy
2. Kiểm tra localStorage['user'] hoặc localStorage['admin_session']
3. Nếu có → POST /auth/refresh (Refresh Token cookie đính kèm tự động)
4. Server verify Refresh Token → tạo Access Token mới
5. Client: setToken(newAccessToken) vào memory
6. Client: GET /auth/me → cập nhật user state
7. Nếu fail → logout() → redirect /auth/login?expired=true
```

### Đăng nhập Admin

```
1. POST /auth/login với tài khoản ADMIN
2. Kiểm tra user.VaiTro === 'ADMIN' (tại AdminContext.loginAdmin)
3. Nếu không phải ADMIN → throw Error
4. setToken(accessToken), lưu admin_session vào localStorage
5. loadData() → Promise.all([
     adminApi.getUsers(),
     adminApi.getDashboard(),
     adminApi.getAuditLogs(),
     adminApi.getReports()
   ])
```

### 2FA Setup & Enable Flow

```
1. POST /auth/2fa/setup
   → Server tạo random secret (base32)
   → Trả về { secret, qrUrl } (otpauth:// URI)

2. User mở Google Authenticator / Authy
   → Scan QR hoặc nhập secret thủ công

3. POST /auth/2fa/enable { code: "123456" }
   → Server verify TOTP với HMAC-SHA1
   → Nếu đúng → UPDATE IsTwoFactorEnabled = 1

4. POST /auth/2fa/disable
   → UPDATE IsTwoFactorEnabled = 0, TwoFactorSecret = NULL
```

---

## 12. Tài khoản mặc định

> **Mật khẩu chung:** `123456`
> **bcrypt hash:** `$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6`

### Tài khoản Admin (VaiTro = 'ADMIN')

| ID | Email | Tên | 2FA |
|---|---|---|---|
| 1 | `admin@shoppingapp.com` | Nguyễn Văn Hùng | ✅ Bật |
| 2 | `mai.admin@shoppingapp.com` | Trần Thị Mai | ❌ Tắt |
| 3 | `tuan.admin@shoppingapp.com` | Lê Văn Tuấn | ❌ Tắt |
| 4 | `huong.admin@shoppingapp.com` | Phạm Thị Hương | ❌ Tắt |
| 5 | `duc.admin@shoppingapp.com` | Hoàng Minh Đức | ❌ Tắt |

### Tài khoản User mẫu (từ seed data)

Email format: `[ten].[ho]@gmail.com` — ví dụ: `thi.nguyen@gmail.com`
Mật khẩu: `123456`

### Nhóm gia đình mẫu (seed data)

| Tên nhóm | Số thành viên | Tổng chi tiêu (seed) |
|---|---|---|
| Hội những người thích nấu ăn | 5 | 26,700,000₫ |
| Gia đình Nguyễn – Hà Nội | 3 | 17,450,000₫ |
| Gia đình Lý – TP.HCM | 3 | 13,750,000₫ |
| Nhà của anh Khoa | 3 | 9,880,000₫ |
| Gia đình bà Thủy | 3 | 7,000,000₫ |

---

## 13. Cấu hình môi trường

### Backend — `/backend/.env`

```env
# Server
SERVER_PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# SQL Server
DB_HOST=localhost
DB_USER=sa
DB_PASS=your_mssql_password_here
DB_NAME=shoppingdb
DB_PORT=1433
# DB_INSTANCE=           ← Chỉ đặt nếu dùng named instance
#                          KHÔNG dùng chung với DB_PORT

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h
```

### Frontend — `/frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [
    figmaAssetResolver(),   // Xử lý import 'figma:asset/...'
    react(),                // React Fast Refresh
    tailwindcss(),          // Tailwind CSS v4
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  assetsInclude: ['**/*.svg', '**/*.csv']
})
```

### Khởi động hệ thống

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

### Script database (chạy tuần tự qua SSMS)

```
01_init.sql       → Tạo và USE database shoppingdb
02_tables.sql     → Tạo 13+ bảng với constraints
03_indexes.sql    → Tạo 5 Nonclustered Indexes
04_views.sql      → Tạo 2 Views báo cáo
05_triggers.sql   → Tạo Trigger tự động NgayCapNhat
06_procedures.sql → Tạo 2 Stored Procedures
07_events.sql     → Script SQL Agent Job (commented out)

--- Seed data ---
seed/01_seed_master.sql  → Users, Groups, Recipes, Inventory
seed/02_seed_bulk.sql    → Shopping lists, Reports, Meal plans
```

---

## 14. Quy ước & Coding Standards

### Backend

| Quy ước | Chi tiết |
|---|---|
| **Raw SQL only** | Không dùng ORM. Tất cả query là parameterized SQL (`pool.request().input(...).query(...)`) |
| **Layered architecture** | Route → Controller → Service → Repository (1 chiều, không skip layer) |
| **Response helper** | Luôn dùng `createSuccess(res, data, message?)` và `createError(res, message, statusCode)` |
| **Validation** | Zod schema định nghĩa trong `*.validation.ts`, áp dụng qua `validateRequest(schema)` middleware |
| **Audit logging** | Mọi thao tác admin phải gọi `repo.addAuditLog(id, name, action, type, status, description, ip)` |
| **Error propagation** | Service throw `{ statusCode: number, message: string }` → Controller `next(e)` → `errorMiddleware` |
| **Soft delete** | Không bao giờ xóa vật lý dữ liệu user/group. Dùng TrangThai hoặc IsDeleted |
| **Parameterized SQL** | Tất cả input user phải dùng `.input('name', type, value)` để chống SQL injection |
| **Cache TTL** | Admin dashboard cache 5 phút (module-level variable), tự reset khi có mutation |

### Frontend

| Quy ước | Chi tiết |
|---|---|
| **Named exports** | Mọi component dùng `export function ComponentName()` — KHÔNG dùng default export |
| **No Zod FE** | Validation phía client dùng HTML constraints (`required`, `min`, `pattern`) hoặc JS thuần |
| **Token in memory** | Access Token KHÔNG lưu localStorage/sessionStorage — chỉ trong `memoryToken` biến module |
| **API wrapper** | Tất cả HTTP call qua `request<T>(endpoint, options)` trong `api.ts` |
| **Toast** | Dùng `useToastContext()` hook hoặc `toast.success/error/info()` từ Toast component |
| **CSS system** | Tailwind v4 + CSS variables (không dùng Tailwind class trực tiếp cho màu sắc thương hiệu) |
| **Charts** | Recharts cho tất cả biểu đồ (AreaChart, BarChart, LineChart, PieChart, ResponsiveContainer) |
| **Forms** | React Hook Form cho form phức tạp. HTML native cho form đơn giản |
| **No polling** | Dùng sự kiện hoặc reload thủ công. KHÔNG tự động polling định kỳ |

### Naming Conventions

| Loại | Backend | Frontend |
|---|---|---|
| File | `kebab-case.ts` | `PascalCase.tsx` |
| Function/method | `camelCase` | `camelCase` |
| Type/Interface | `PascalCase` | `PascalCase` |
| Constant | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| DB column | Vietnamese PascalCase: `HoTen`, `MaNguoiDung` | — |
| Route path | `/kebab-case/:param` | `/kebab-case` |
| Env variable | `UPPER_SNAKE_CASE` | `VITE_UPPER_SNAKE_CASE` |
| Context | — | `XxxContext.tsx` + `useXxx()` hook |

### CSS Variables hệ thống (`styles/index.css`)

```css
/* Màu chủ đạo */
--purple-deep        /* Tím đậm — màu primary */
--purple-light       /* Tím nhạt */
--gold               /* Vàng accent */
--gold-light         /* Vàng nhạt */

/* Trạng thái */
--success            /* Xanh lá */
--success-light      /* Xanh lá nhạt */
--danger             /* Đỏ */
--danger-light       /* Đỏ nhạt */
--warning            /* Vàng cam */
--warning-light      /* Vàng cam nhạt */
--food-orange        /* Cam thực phẩm */

/* Layout */
--text-dark          /* Văn bản chính */
--text-muted         /* Văn bản phụ */
--card-bg            /* Nền card (xám cực nhạt) */
--border-light       /* Viền */
--border-purple      /* Viền tím nhạt */

/* Shadows & Radius */
--shadow-card        /* Box shadow card */
--shadow-btn         /* Box shadow button */
--radius             /* Border radius lớn (28px) */
--radius-sm          /* Border radius nhỏ (14px) */
--radius-btn         /* Border radius button */

/* Typography */
--font-body          /* Font chính: Inter, system-ui */
```

---

## 🔗 Tài liệu liên quan trong project

| File | Mô tả |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | Single Source of Truth cho AI agents — schema đầy đủ, business rules |
| [`BaoCaoLoiHeThong.md`](./BaoCaoLoiHeThong.md) | Phân tích chi tiết 32 lỗi logic nghiệp vụ |
| [`README.md`](./README.md) | Hướng dẫn cài đặt và chạy project |
| [`database/schema/`](./database/schema/) | SQL scripts khởi tạo cơ sở dữ liệu |
| [`database/seed/`](./database/seed/) | SQL scripts tạo dữ liệu mẫu |

---

*📝 Được tổng hợp từ phân tích toàn bộ codebase — 2026-06-18*
