# 🛒 DBLAB - Hệ Thống Đi Chợ Tiện Lợi (Grocery Shopping Convenience System)

Dự án Hệ thống hỗ trợ lập kế hoạch bữa ăn, quản lý thực phẩm gia đình, và báo cáo chi tiêu dành cho nhiều thành viên trong gia đình. Hệ thống được thiết kế theo kiến trúc **Clean Architecture** kết hợp **Layered Architecture**, đạt tiêu chuẩn **Enterprise-level** nhằm đảm bảo tính bảo trì, mở rộng và bảo mật cao nhất.

---

## 🏛 Kiến trúc hệ thống tổng quan

Hệ thống được xây dựng theo mô hình Client-Server hiện đại:
- **Frontend (Client):** React App (Vite) với kiến trúc Component-Based, quản lý state tập trung và phân tách layer API clear.
- **Backend (Server):** Node.js/Express theo mô hình **Advanced 3-Layer Architecture** (Route - Controller - Service - Repository) tích hợp thêm các layer bổ trợ (Validator, Job, Middleware).
- **Database:** MySQL với Sơ đồ ERD chuẩn hóa, đảm bảo tính toàn vẹn dữ liệu cho mô hình Family-Sharing.

---

frontend/
├── app/                          # Entry app configs
│   ├── App.jsx
│   ├── main.jsx
│   └── providers.jsx            # Theme, Router, Store providers
│
├── assets/                       # Static resources
│   ├── images/                  # Landing, logo, food images
│   ├── icons/                   # SVG, custom food icons
│   ├── illustrations/           # Auth, empty states, onboarding
│   ├── fonts/                   # Inter, Be Vietnam Pro
│   └── styles/                  # Global CSS, theme variables
│
├── components/                   # Reusable + domain components
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Drawer/
│   │   ├── Table/
│   │   ├── Pagination/
│   │   ├── ConfirmDialog/
│   │   ├── Badge/
│   │   ├── EmptyState/
│   │   ├── LoadingSkeleton/
│   │   └── Toast/
│   │
│   ├── dashboard/
│   │   ├── SummaryCards/
│   │   ├── ExpenseChart/
│   │   ├── WasteChart/
│   │   └── ExpiryAlerts/
│   │
│   ├── shopping/
│   │   ├── ShoppingChecklist/
│   │   ├── ShoppingItemRow/
│   │   ├── AssigneeChip/
│   │   └── PurchaseStatusBadge/
│   │
│   ├── inventory/
│   │   ├── FoodCard/
│   │   ├── QuantityStepper/
│   │   ├── ExpiryBadge/
│   │   └── FoodLocationFilter/
│   │
│   ├── meal/
│   │   ├── RecipeCard/
│   │   ├── IngredientChecklist/
│   │   ├── IngredientProgress/
│   │   ├── MealCalendar/
│   │   └── MissingIngredientModal/
│   │
│   └── admin/
│       ├── UserTable/
│       ├── MasterDataForm/
│       ├── AuditLogTable/
│       └── SystemAnalyticsCards/
│
├── hooks/                        # Custom hooks
│   ├── useAuth.js
│   ├── useShoppingList.js
│   ├── useInventory.js
│   ├── useMealPlanner.js
│   ├── useAdmin.js
│   └── useDebounce.js
│
├── layouts/                      # Multi-layout system
│   ├── GuestLayout/
│   ├── AuthLayout/
│   ├── AdminLayout/
│   └── MainLayout/
│
├── routes/                       # Route configs + guards
│   ├── index.jsx
│   ├── PrivateRoute.jsx
│   ├── AdminRoute.jsx
│   ├── GroupLeaderRoute.jsx
│   └── GuestOnlyRoute.jsx
│
├── pages/                        # Business views
│   ├── Homepage/
│   │
│   ├── Auth/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── ForgotPass/
│   │   ├── ChangePass/
│   │   ├── SwitchAccount/
│   │   └── Logout/
│   │
│   ├── Admin/
│   │   ├── Auth/
│   │   │   ├── Login/
│   │   │   ├── ForgotPass/
│   │   │   └── ChangePass/
│   │   │
│   │   ├── Dashboard/
│   │   ├── Users/
│   │   ├── MasterData/
│   │   ├── AuditLogs/
│   │   ├── Reports/
│   │   └── Settings/
│   │
│   ├── Dashboard/
│   ├── ShoppingList/
│   ├── Inventory/
│   ├── MealPlan/
│   ├── Recipes/                 # MonAn + NguyenLieuMon
│   ├── Reports/                 # BaoCaoChiTieu
│   ├── FamilyMembers/
│   └── Settings/
│
├── services/                     # API layer
│   ├── api.js
│   │
│   ├── auth/
│   │   ├── login.service.js
│   │   ├── register.service.js
│   │   ├── refresh.service.js
│   │   └── switchAccount.service.js
│   │
│   ├── admin/
│   │   ├── adminAuth.service.js
│   │   ├── users.service.js
│   │   ├── reports.service.js
│   │   └── masterData.service.js
│   │
│   ├── shopping/
│   │   ├── shoppingList.service.js
│   │   └── shoppingAssignment.service.js
│   │
│   ├── inventory/
│   │   ├── inventory.service.js
│   │   └── expiryAlert.service.js
│   │
│   ├── meal/
│   │   ├── recipes.service.js
│   │   └── planner.service.js
│   │
│   └── reports/
│       └── expenseReport.service.js
│
├── store/                        # Zustand / Redux stores
│   ├── auth.store.js
│   ├── admin.store.js
│   ├── group.store.js
│   ├── ui.store.js
│   ├── shopping.store.js
│   ├── inventory.store.js
│   ├── meal.store.js
│   └── report.store.js
│
├── utils/                        # Helpers
│   ├── formatters.js
│   ├── validators.js
│   ├── permissions.js
│   ├── constants.js
│   ├── date.js
│   └── helpers.js
│
└── types/                        # TS types / JSDoc typedefs
    ├── auth.ts
    ├── shopping.ts
    ├── inventory.ts
    ├── meal.ts
    ├── reports.ts
    └── admin.ts

---

## ⚙️ 2. Cấu trúc Backend (Senior Layered Architecture)

Backend áp dụng kiến trúc phân tầng chuyên sâu, tách biệt hoàn toàn Business Logic khỏi HTTP và Database Layer.

```text
backend/
├── src/
│   ├── app.js                         # Express app bootstrap
│   ├── server.js                      # HTTP server entry
│
│   ├── config/                        # App configs
│   │   ├── db.js                      # MySQL pool / Prisma / Sequelize
│   │   ├── jwt.js                     # Access + refresh token config
│   │   ├── cors.js
│   │   ├── cloudinary.js
│   │   └── env.js
│
│   ├── api/
│   │   └── routes/                    # API routes by domain
│   │       ├── index.js
│   │       │
│   │       ├── auth.routes.js
│   │       ├── adminAuth.routes.js
│   │       ├── admin.routes.js
│   │       │
│   │       ├── dashboard.routes.js
│   │       ├── shopping.routes.js
│   │       ├── inventory.routes.js
│   │       ├── meal.routes.js
│   │       ├── recipe.routes.js
│   │       ├── family.routes.js
│   │       └── report.routes.js
│
│   ├── controllers/                   # HTTP layer only
│   │   ├── auth.ctrl.js
│   │   ├── adminAuth.ctrl.js
│   │   ├── admin.ctrl.js
│   │   ├── dashboard.ctrl.js
│   │   ├── shopping.ctrl.js
│   │   ├── inventory.ctrl.js
│   │   ├── meal.ctrl.js
│   │   ├── recipe.ctrl.js
│   │   ├── family.ctrl.js
│   │   └── report.ctrl.js
│
│   ├── services/                      # Business logic layer
│   │   ├── auth/
│   │   │   ├── login.srv.js
│   │   │   ├── register.srv.js
│   │   │   ├── refreshToken.srv.js
│   │   │   └── switchAccount.srv.js
│   │   │
│   │   ├── admin/
│   │   │   ├── adminAuth.srv.js
│   │   │   ├── users.srv.js
│   │   │   ├── analytics.srv.js
│   │   │   └── masterData.srv.js
│   │   │
│   │   ├── dashboard/
│   │   │   └── summary.srv.js
│   │   │
│   │   ├── shopping/
│   │   │   ├── shoppingList.srv.js
│   │   │   └── assignment.srv.js
│   │   │
│   │   ├── inventory/
│   │   │   ├── inventory.srv.js
│   │   │   └── expiryAlert.srv.js
│   │   │
│   │   ├── meal/
│   │   │   ├── planner.srv.js
│   │   │   └── suggestion.srv.js
│   │   │
│   │   ├── recipe/
│   │   │   ├── recipes.srv.js
│   │   │   └── ingredients.srv.js
│   │   │
│   │   ├── family/
│   │   │   ├── group.srv.js
│   │   │   └── members.srv.js
│   │   │
│   │   └── reports/
│   │       └── expenseReport.srv.js
│
│   ├── repositories/                  # SQL/Data layer
│   │   ├── auth/
│   │   │   └── user.repo.js
│   │   │
│   │   ├── shopping/
│   │   │   ├── shoppingList.repo.js
│   │   │   └── shoppingItems.repo.js
│   │   │
│   │   ├── inventory/
│   │   │   └── inventory.repo.js
│   │   │
│   │   ├── meal/
│   │   │   └── mealPlan.repo.js
│   │   │
│   │   ├── recipe/
│   │   │   ├── recipe.repo.js
│   │   │   └── ingredients.repo.js
│   │   │
│   │   ├── family/
│   │   │   ├── family.repo.js
│   │   │   └── members.repo.js
│   │   │
│   │   ├── reports/
│   │   │   └── expenseReport.repo.js
│   │   │
│   │   └── admin/
│   │       ├── users.repo.js
│   │       └── audit.repo.js
│
│   ├── middlewares/
│   │   ├── auth.mid.js
│   │   ├── admin.mid.js
│   │   ├── groupLeader.mid.js
│   │   ├── error.mid.js
│   │   └── rateLimit.mid.js
│
│   ├── validators/
│   │   ├── auth.schema.js
│   │   ├── shopping.schema.js
│   │   ├── inventory.schema.js
│   │   ├── meal.schema.js
│   │   ├── recipe.schema.js
│   │   ├── family.schema.js
│   │   └── report.schema.js
│
│   ├── jobs/
│   │   ├── expiryAlert.job.js
│   │   ├── expenseReport.job.js
│   │   └── mealSuggestion.job.js
│
│   ├── constants/
│   │   ├── roles.js
│   │   ├── mealTime.js
│   │   ├── statusCodes.js
│   │   └── messages.js
│
│   ├── utils/
│   │   ├── logger.js
│   │   ├── mailer.js
│   │   ├── password.js
│   │   ├── token.js
│   │   └── response.js
│
│   └── docs/
│       └── swagger.yaml
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── .env
---

## 🛡 3. An toàn & Bảo mật (Security Strategy)

Hệ thống triển khai bảo mật đa lớp:
1. **Validation Layer:** Mọi dữ liệu vào được kiểm soát bởi Schema (Zod/Joi) trước khi vào Controller.
2. **Authentication Layer:** Sử dụng JWT (Access Token & Refresh Token) với cơ chế Revoke an toàn.
3. **Authorization Layer (RBAC):**
   - **System Level:** Admin vs User.
   - **Family Level:** Trưởng nhóm (Manager) vs Thành viên (Member).
4. **Data Integrity:** Sử dụng Repositories và Transactions nhằm đảm bảo dữ liệu shopping-list đồng bộ tuyệt đối với inventory.

---

## 📅 4. Các tính năng "Senior" tích hợp

- **Smart Suggestions:** Tự động quét kho để gợi ý món ăn, ưu tiên thực phẩm sắp hết hạn.
- **Auto Inventory Sync:** Món hàng mua xong trong danh sách sẽ tự động nhảy vào kho lạnh ảo.
- **Cron Alert System:** Gửi thông báo/email cho gia đình mỗi sáng về thực phẩm cần dùng gấp.
- **Audit Logs:** Ghi lại vết mọi thay đổi quan trọng trong nhóm gia đình.
