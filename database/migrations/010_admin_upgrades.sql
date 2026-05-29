-- =============================================================
-- MIGRATION 010: Admin Dashboard & Security Upgrades
-- Mục tiêu:
--   1. Tạo bảng AuditLogs lưu vết lịch sử Admin thao tác
--   2. Tạo index IX_NguoiDung_TrangThai trên bảng NguoiDung(TrangThai) để tăng tốc đếm
-- =============================================================

USE shoppingdb;
GO

-- -------------------------------------------------------
-- 1. Tạo bảng AuditLogs
-- -------------------------------------------------------
IF OBJECT_ID('AuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE AuditLogs (
        MaLog INT IDENTITY(1,1) PRIMARY KEY,
        MaAdmin INT NULL,
        HoTenAdmin NVARCHAR(100) NOT NULL,
        HanhDong NVARCHAR(100) NOT NULL,
        Loai NVARCHAR(50) NOT NULL, -- 'auth', 'user', 'data', 'recipe', 'settings', 'report', 'shopping'
        TrangThai NVARCHAR(30) NOT NULL, -- 'success', 'error', 'warning'
        MoTa NVARCHAR(500) NOT NULL,
        DiaChiIP NVARCHAR(50) NOT NULL,
        NgayTao DATETIME DEFAULT GETDATE(),

        CONSTRAINT FK_AuditLogs_User FOREIGN KEY (MaAdmin) REFERENCES NguoiDung(MaNguoiDung) ON DELETE SET NULL
    );
    PRINT 'Created table AuditLogs';
END
GO

-- -------------------------------------------------------
-- 2. Tạo index IX_NguoiDung_TrangThai
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_NguoiDung_TrangThai' AND object_id = OBJECT_ID('NguoiDung'))
BEGIN
    CREATE INDEX IX_NguoiDung_TrangThai
    ON NguoiDung(TrangThai);
    PRINT 'Created index IX_NguoiDung_TrangThai';
END
GO

PRINT 'Migration 010_admin_upgrades completed successfully.';
GO
