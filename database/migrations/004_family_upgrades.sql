SET QUOTED_IDENTIFIER ON;
GO
-- ============================================================
-- MIGRATION 004: Family Notifications & FK Cascades
-- Mô tả : Tạo bảng FamilyNotifications để lưu nhật ký hoạt động
--         của nhóm gia đình và nâng cấp khóa ngoại vật lý an toàn.
-- Ngày  : 2026-05-29
-- ============================================================
USE shoppingdb;
GO

-- 1. Tạo bảng FamilyNotifications nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'FamilyNotifications' AND type = 'U')
BEGIN
    CREATE TABLE FamilyNotifications (
        Id          INT              IDENTITY(1,1),
        MaNhom      INT              NOT NULL,
        NoiDung     NVARCHAR(500)    NOT NULL,
        Loai        NVARCHAR(50)     NOT NULL, -- 'JOIN', 'LEAVE', 'TRANSFER', 'INFO_UPDATE'
        NgayTao     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT PK_FamilyNotifications PRIMARY KEY (Id),
        CONSTRAINT FK_FamilyNotifications_Nhom 
            FOREIGN KEY (MaNhom) REFERENCES NhomGiaDinh(MaNhom) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_FamilyNotifications_MaNhom 
        ON FamilyNotifications(MaNhom) 
        INCLUDE (NoiDung, Loai, NgayTao);

    PRINT '✅ Tạo bảng FamilyNotifications thành công';
END
ELSE
    PRINT '⏭  Bảng FamilyNotifications đã tồn tại — bỏ qua';
GO

-- 2. Thay đổi ràng buộc FK_FamilyInvites_Creator thành ON DELETE CASCADE
-- Việc này giúp khi xóa tài khoản người dùng vật lý khỏi hệ thống, toàn bộ mã mời do họ tạo cũng tự động bay màu mà không gây lỗi khóa ngoại vật lý crash server
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_FamilyInvites_Creator')
BEGIN
    ALTER TABLE FamilyInvites DROP CONSTRAINT FK_FamilyInvites_Creator;
    ALTER TABLE FamilyInvites ADD CONSTRAINT FK_FamilyInvites_Creator 
        FOREIGN KEY (TaoBoiId) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE;
    PRINT '✅ Thay đổi ràng buộc FK_FamilyInvites_Creator thành ON DELETE CASCADE thành công';
END
GO
