USE shoppingdb;
GO

-- ==========================================
-- TRIGGERS (CẬP NHẬT TỰ ĐỘNG)
-- ==========================================

-- 1. Trigger: Tự động cập nhật NgayCapNhat cho bảng NguoiDung
CREATE OR ALTER TRIGGER trg_NguoiDung_Update
ON NguoiDung
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE NguoiDung
    SET NgayCapNhat = GETDATE()
    FROM NguoiDung N
    INNER JOIN inserted i ON N.MaNguoiDung = i.MaNguoiDung;
END;
GO
