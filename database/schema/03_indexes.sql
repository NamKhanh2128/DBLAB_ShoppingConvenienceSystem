USE shoppingdb;
GO

-- ==========================================
-- TẠO CHỈ MỤC (INDEXES) ĐỂ TỐI ƯU TRUY VẤN
-- ==========================================

-- 1. Tối ưu tìm kiếm Người dùng qua Email
CREATE NONCLUSTERED INDEX IDX_NguoiDung_Email ON NguoiDung(Email);
GO

-- 2. Tối ưu truy vấn tìm kiếm Kho thực phẩm theo Nhóm và Ngày Hết Hạn
CREATE NONCLUSTERED INDEX IDX_KhoThucPham_MaNhom_HanSuDung ON KhoThucPham(MaNhom, HanSuDung);
GO

-- 3. Tối ưu tìm kiếm Chi tiết mua sắm theo Danh sách và Trạng thái
CREATE NONCLUSTERED INDEX IDX_ChiTietMuaSam_MaDanhSach_DaMua ON ChiTietMuaSam(MaDanhSach, DaMua);
GO

-- 4. Tối ưu tìm kiếm Kế hoạch bữa ăn theo Nhóm và Ngày
CREATE NONCLUSTERED INDEX IDX_KeHoachBuaAn_MaNhom_Ngay ON KeHoachBuaAn(MaNhom, Ngay);
GO

-- 5. Tối ưu tìm kiếm Món ăn theo Tên
CREATE NONCLUSTERED INDEX IDX_MonAn_TenMon ON MonAn(TenMon);
GO
