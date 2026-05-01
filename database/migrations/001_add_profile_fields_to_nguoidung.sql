-- ============================================================
-- MIGRATION: 001_add_profile_fields_to_nguoidung.sql
-- Mô tả : Thêm cột SoDienThoai và Bio vào bảng NguoiDung
--          để đồng bộ với Backend model và Frontend form.
-- Ngày  : 2026-05-01
-- ============================================================
USE shoppingdb;
GO

-- Thêm cột SoDienThoai (nếu chưa có)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NguoiDung')
      AND name = 'SoDienThoai'
)
BEGIN
    ALTER TABLE NguoiDung
    ADD SoDienThoai NVARCHAR(20) NULL;

    PRINT '✅ Đã thêm cột SoDienThoai vào bảng NguoiDung';
END
ELSE
BEGIN
    PRINT '⏭  Cột SoDienThoai đã tồn tại — bỏ qua';
END
GO

-- Thêm cột Bio (nếu chưa có)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NguoiDung')
      AND name = 'Bio'
)
BEGIN
    ALTER TABLE NguoiDung
    ADD Bio NVARCHAR(500) NULL;

    PRINT '✅ Đã thêm cột Bio vào bảng NguoiDung';
END
ELSE
BEGIN
    PRINT '⏭  Cột Bio đã tồn tại — bỏ qua';
END
GO

-- Xác nhận cấu trúc bảng sau migration
SELECT
    COLUMN_NAME     AS Cot,
    DATA_TYPE       AS KieuDuLieu,
    CHARACTER_MAXIMUM_LENGTH AS DoDai,
    IS_NULLABLE     AS CoTheBNull
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'NguoiDung'
ORDER BY ORDINAL_POSITION;
GO
