-- =============================================================
-- MIGRATION 007: Recipes Upgrades
-- Mục tiêu:
--   1. Thêm cột MaNhom, MaNguoiTao để phân quyền sở hữu công thức.
--      - MaNhom = NULL  → System Recipe (công khai, không ai xóa được)
--      - MaNhom = X     → Recipe riêng tư của Gia đình X
--   2. Thêm metadata: ThoiGian, KhauPhan, DoKho, DanhMuc, MoTa, HinhAnh
--      (các cột này trước đây Frontend đọc từ raw record nhưng không có
--       trong DB gốc, dẫn đến luôn dùng giá trị fallback).
-- =============================================================

USE shoppingdb;
GO

-- -------------------------------------------------------
-- 1. Thêm cột ownership vào MonAn (nếu chưa tồn tại)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'MaNhom')
BEGIN
    ALTER TABLE MonAn ADD MaNhom INT NULL;
    PRINT 'Added column MaNhom to MonAn';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'MaNguoiTao')
BEGIN
    ALTER TABLE MonAn ADD MaNguoiTao INT NULL;
    PRINT 'Added column MaNguoiTao to MonAn';
END
GO

-- -------------------------------------------------------
-- 2. Thêm cột metadata vào MonAn (nếu chưa tồn tại)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'ThoiGian')
BEGIN
    ALTER TABLE MonAn ADD ThoiGian INT NULL;
    PRINT 'Added column ThoiGian to MonAn';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'KhauPhan')
BEGIN
    ALTER TABLE MonAn ADD KhauPhan INT NULL;
    PRINT 'Added column KhauPhan to MonAn';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'DoKho')
BEGIN
    ALTER TABLE MonAn ADD DoKho NVARCHAR(20) NULL;
    PRINT 'Added column DoKho to MonAn';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'DanhMuc')
BEGIN
    ALTER TABLE MonAn ADD DanhMuc NVARCHAR(50) NULL;
    PRINT 'Added column DanhMuc to MonAn';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'MoTa')
BEGIN
    ALTER TABLE MonAn ADD MoTa NVARCHAR(500) NULL;
    PRINT 'Added column MoTa to MonAn';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MonAn') AND name = 'HinhAnh')
BEGIN
    ALTER TABLE MonAn ADD HinhAnh NVARCHAR(500) NULL;
    PRINT 'Added column HinhAnh to MonAn';
END
GO

-- -------------------------------------------------------
-- 3. Thêm Foreign Key constraints (nếu chưa tồn tại)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_MonAn_Nhom')
BEGIN
    ALTER TABLE MonAn
    ADD CONSTRAINT FK_MonAn_Nhom
    FOREIGN KEY (MaNhom)
    REFERENCES NhomGiaDinh(MaNhom)
    ON DELETE SET NULL;
    PRINT 'Added FK_MonAn_Nhom constraint';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_MonAn_NguoiTao')
BEGIN
    ALTER TABLE MonAn
    ADD CONSTRAINT FK_MonAn_NguoiTao
    FOREIGN KEY (MaNguoiTao)
    REFERENCES NguoiDung(MaNguoiDung)
    ON DELETE SET NULL;
    PRINT 'Added FK_MonAn_NguoiTao constraint';
END
GO

-- -------------------------------------------------------
-- 4. Tạo Index hỗ trợ truy vấn theo nhóm
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MonAn_MaNhom' AND object_id = OBJECT_ID('MonAn'))
BEGIN
    CREATE INDEX IX_MonAn_MaNhom ON MonAn(MaNhom);
    PRINT 'Created index IX_MonAn_MaNhom';
END
GO

PRINT 'Migration 007_recipes_upgrades completed successfully.';
GO
