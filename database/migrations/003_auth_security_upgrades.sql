SET QUOTED_IDENTIFIER ON;
GO
-- ============================================================
-- MIGRATION 003: Auth and Security Upgrades
-- Mô tả : Bổ sung các trường bảo mật và xác thực 2 lớp (MFA)
--         cho bảng NguoiDung.
-- Ngày  : 2026-05-29
-- ============================================================
USE shoppingdb;
GO

-- 1. Thêm cột MatKhauNgayCapNhat để quản lý đồng bộ đăng xuất khi đổi mật khẩu
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NguoiDung') AND name = 'MatKhauNgayCapNhat')
BEGIN
    ALTER TABLE NguoiDung ADD MatKhauNgayCapNhat DATETIME2 NOT NULL DEFAULT GETUTCDATE();
    PRINT '✅ Thêm cột MatKhauNgayCapNhat thành công';
END
ELSE
    PRINT '⏭  Cột MatKhauNgayCapNhat đã tồn tại — bỏ qua';
GO

-- 2. Thêm cột TwoFactorSecret để lưu khóa bí mật TOTP
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NguoiDung') AND name = 'TwoFactorSecret')
BEGIN
    ALTER TABLE NguoiDung ADD TwoFactorSecret NVARCHAR(255) NULL;
    PRINT '✅ Thêm cột TwoFactorSecret thành công';
END
ELSE
    PRINT '⏭  Cột TwoFactorSecret đã tồn tại — bỏ qua';
GO

-- 3. Thêm cột IsTwoFactorEnabled để bật/tắt MFA
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NguoiDung') AND name = 'IsTwoFactorEnabled')
BEGIN
    ALTER TABLE NguoiDung ADD IsTwoFactorEnabled BIT NOT NULL DEFAULT 0;
    PRINT '✅ Thêm cột IsTwoFactorEnabled thành công';
END
ELSE
    PRINT '⏭  Cột IsTwoFactorEnabled đã tồn tại — bỏ qua';
GO

-- Đồng bộ giá trị mặc định cho dữ liệu cũ (nếu có)
UPDATE NguoiDung SET MatKhauNgayCapNhat = GETUTCDATE() WHERE MatKhauNgayCapNhat IS NULL;
UPDATE NguoiDung SET IsTwoFactorEnabled = 0 WHERE IsTwoFactorEnabled IS NULL;
GO

-- Xác nhận cấu trúc bảng NguoiDung sau khi nâng cấp
SELECT 'NguoiDung' AS Bang,
    COLUMN_NAME AS Cot, DATA_TYPE AS KieuDuLieu, IS_NULLABLE AS Nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'NguoiDung'
ORDER BY ORDINAL_POSITION;
GO
