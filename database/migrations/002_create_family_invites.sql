-- ============================================================
-- MIGRATION 002: Family Invite System
-- Mô tả : Tạo bảng FamilyInvites để hỗ trợ mã mời tham gia nhóm.
--         Nâng cấp NhomGiaDinh và ThanhVienNhom thêm audit fields.
-- Ngày  : 2026-05-01
-- ============================================================
USE shoppingdb;
GO

-- ============================================================
-- BẢNG 1: Nâng cấp NhomGiaDinh — thêm audit fields chuẩn
-- (Giữ nguyên INT PK để backward-compatible với dữ liệu cũ)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NhomGiaDinh') AND name = 'MaxThanhVien')
    ALTER TABLE NhomGiaDinh ADD MaxThanhVien INT NOT NULL DEFAULT 10;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NhomGiaDinh') AND name = 'MoTa')
    ALTER TABLE NhomGiaDinh ADD MoTa NVARCHAR(500) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NhomGiaDinh') AND name = 'IsDeleted')
    ALTER TABLE NhomGiaDinh ADD IsDeleted BIT NOT NULL DEFAULT 0;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NhomGiaDinh') AND name = 'NgayCapNhat')
    ALTER TABLE NhomGiaDinh ADD NgayCapNhat DATETIME2 DEFAULT GETUTCDATE();
GO

-- ============================================================
-- BẢNG 2: FamilyInvites — mã mời tham gia nhóm gia đình
--
-- Thiết kế key:
--   • Id          : UNIQUEIDENTIFIER — UUID v4, tránh enumerable IDs
--   • Code        : 8 ký tự, UNIQUE — mã người dùng nhập vào
--   • MaxUses     : Số lần tối đa có thể dùng (default 1 = single-use)
--   • UsedCount   : Đếm thực tế — dùng với UPDLOCK khi join để tránh race condition
--   • ExpiresAt   : Hết hạn sau 48h
--   • IsDeleted   : Soft-delete — admin có thể thu hồi mã mà không mất audit trail
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'FamilyInvites' AND type = 'U')
BEGIN
    CREATE TABLE FamilyInvites (
        Id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        MaNhom      INT              NOT NULL,
        Code        NVARCHAR(8)      NOT NULL,
        TaoBoiId    INT              NOT NULL,
        MaxUses     INT              NOT NULL DEFAULT 1,
        UsedCount   INT              NOT NULL DEFAULT 0,
        ExpiresAt   DATETIME2        NOT NULL,
        IsDeleted   BIT              NOT NULL DEFAULT 0,
        NgayTao     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        NgayCapNhat DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT PK_FamilyInvites        PRIMARY KEY (Id),
        CONSTRAINT UQ_FamilyInvites_Code   UNIQUE (Code),
        CONSTRAINT CK_FamilyInvites_Uses   CHECK (MaxUses >= 1 AND MaxUses <= 200),
        CONSTRAINT CK_FamilyInvites_Count  CHECK (UsedCount >= 0),

        CONSTRAINT FK_FamilyInvites_Nhom
            FOREIGN KEY (MaNhom) REFERENCES NhomGiaDinh(MaNhom) ON DELETE CASCADE,

        CONSTRAINT FK_FamilyInvites_Creator
            FOREIGN KEY (TaoBoiId) REFERENCES NguoiDung(MaNguoiDung) ON DELETE NO ACTION
    );

    -- Index để lookup nhanh theo Code (hot path khi user nhập mã)
    CREATE NONCLUSTERED INDEX IX_FamilyInvites_Code
        ON FamilyInvites (Code)
        INCLUDE (MaNhom, UsedCount, MaxUses, ExpiresAt, IsDeleted);

    -- Index để lấy danh sách invite theo nhóm
    CREATE NONCLUSTERED INDEX IX_FamilyInvites_MaNhom
        ON FamilyInvites (MaNhom)
        WHERE IsDeleted = 0;

    PRINT '✅ Tạo bảng FamilyInvites thành công';
END
ELSE
    PRINT '⏭  Bảng FamilyInvites đã tồn tại — bỏ qua';
GO

-- ============================================================
-- TRIGGER: Tự động cập nhật NgayCapNhat cho FamilyInvites
-- ============================================================
CREATE OR ALTER TRIGGER trg_FamilyInvites_UpdatedAt
ON FamilyInvites
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE FamilyInvites
    SET NgayCapNhat = GETUTCDATE()
    FROM FamilyInvites fi
    INNER JOIN inserted i ON fi.Id = i.Id;
END;
GO

-- Trigger tương tự cho NhomGiaDinh
CREATE OR ALTER TRIGGER trg_NhomGiaDinh_UpdatedAt
ON NhomGiaDinh
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE NhomGiaDinh
    SET NgayCapNhat = GETUTCDATE()
    FROM NhomGiaDinh n
    INNER JOIN inserted i ON n.MaNhom = i.MaNhom;
END;
GO

-- Xác nhận kết quả
SELECT 'FamilyInvites' AS Bang,
    COLUMN_NAME AS Cot, DATA_TYPE AS KieuDuLieu, IS_NULLABLE AS Nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'FamilyInvites'
ORDER BY ORDINAL_POSITION;
GO
