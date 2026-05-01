USE shoppingdb;
GO

-- ==========================================
-- STORED PROCEDURES (THỦ TỤC LƯU TRỮ)
-- ==========================================

-- 1. SP: Tạo Nhóm Gia Đình Mới và Thêm Trưởng Nhóm
CREATE OR ALTER PROCEDURE sp_TaoNhomGiaDinh
    @TenNhom NVARCHAR(100),
    @MaNguoiDung INT,
    @MaNhomMoi INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Thêm mới Nhóm Gia Đình
        INSERT INTO NhomGiaDinh (TenNhom, TruongNhom)
        VALUES (@TenNhom, @MaNguoiDung);

        SET @MaNhomMoi = SCOPE_IDENTITY();

        -- Thêm người dùng vào nhóm với vai trò LEADER
        INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro)
        VALUES (@MaNhomMoi, @MaNguoiDung, 'LEADER');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 2. SP: Hoàn thành mua sắm và đẩy vào kho
CREATE OR ALTER PROCEDURE sp_HoanThanhMuaSamKho
    @MaDanhSach INT,
    @MaNhom INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Lấy tất cả các món ĐÃ MUA và đưa vào kho
        INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi)
        SELECT 
            DS.MaNhom, CT.TenThucPham, CT.SoLuong, CT.DonVi
        FROM ChiTietMuaSam CT
        JOIN DanhSachMuaSam DS ON CT.MaDanhSach = DS.MaDanhSach
        WHERE CT.MaDanhSach = @MaDanhSach AND CT.DaMua = 1;

        -- 2. Cập nhật trạng thái Danh sách Mua sắm thành COMPLETED
        UPDATE DanhSachMuaSam
        SET TrangThai = 'COMPLETED'
        WHERE MaDanhSach = @MaDanhSach;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
