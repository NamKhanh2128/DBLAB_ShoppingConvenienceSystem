USE shoppingdb;
GO
SET NOCOUNT ON;
GO

-- ================================================================
-- SEED v2.0 | shoppingdb | 2026-06-18
-- Mật khẩu mặc định tất cả tài khoản: 123456
-- Hash bcrypt cost=10: $2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6
-- Chạy file này TRƯỚC, sau đó chạy 02_seed_bulk.sql
-- ================================================================

-- ================================================================
-- SECTION 1: XÓA DỮ LIỆU CŨ & RESET IDENTITY
-- ================================================================
DELETE FROM AuditLogs;
DELETE FROM BaoCaoChiTieu;
DELETE FROM KeHoachBuaAn;
DELETE FROM NhatKyKho;
DELETE FROM NguyenLieuMon;
DELETE FROM MonAn;
DELETE FROM KhoThucPham;
DELETE FROM ChiTietMuaSam;
DELETE FROM DanhSachMuaSam;
DELETE FROM FamilyNotifications;
DELETE FROM FamilyInvites;
DELETE FROM ThanhVienNhom;
DELETE FROM NhomGiaDinh;
DELETE FROM NguoiDung;
GO

DBCC CHECKIDENT ('NguoiDung',           RESEED, 0);
DBCC CHECKIDENT ('NhomGiaDinh',         RESEED, 0);
DBCC CHECKIDENT ('DanhSachMuaSam',      RESEED, 0);
DBCC CHECKIDENT ('ChiTietMuaSam',       RESEED, 0);
DBCC CHECKIDENT ('KhoThucPham',         RESEED, 0);
DBCC CHECKIDENT ('NhatKyKho',           RESEED, 0);
DBCC CHECKIDENT ('MonAn',               RESEED, 0);
DBCC CHECKIDENT ('KeHoachBuaAn',        RESEED, 0);
DBCC CHECKIDENT ('BaoCaoChiTieu',       RESEED, 0);
DBCC CHECKIDENT ('AuditLogs',           RESEED, 0);
DBCC CHECKIDENT ('FamilyNotifications', RESEED, 0);
GO

-- ================================================================
-- SECTION 2: NGƯỜI DÙNG — 50 tài khoản (5 ADMIN + 45 MEMBER)
-- ================================================================
SET IDENTITY_INSERT NguoiDung ON;
INSERT INTO NguoiDung
  (MaNguoiDung, HoTen, Email, MatKhauHash, SoDienThoai, Bio, VaiTro, TrangThai, NgayTao, MatKhauNgayCapNhat, IsTwoFactorEnabled)
VALUES
-- ADMIN (5)
(1,  N'Nguyễn Văn Hùng',   'admin@shoppingapp.com',       '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0901000001',N'Quản trị viên hệ thống chính.','ADMIN','ACTIVE',DATEADD(month,-12,GETDATE()),GETUTCDATE(),1),
(2,  N'Trần Thị Mai',       'mai.admin@shoppingapp.com',   '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0901000002',N'Phụ trách quản lý người dùng.','ADMIN','ACTIVE',DATEADD(month,-10,GETDATE()),GETUTCDATE(),0),
(3,  N'Lê Văn Tuấn',        'tuan.admin@shoppingapp.com',  '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0901000003',N'Phụ trách dữ liệu và công thức.','ADMIN','ACTIVE',DATEADD(month,-10,GETDATE()),GETUTCDATE(),0),
(4,  N'Phạm Thị Hương',     'huong.admin@shoppingapp.com', '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0901000004',N'Hỗ trợ kỹ thuật và báo cáo.','ADMIN','ACTIVE',DATEADD(month,-9,GETDATE()),GETUTCDATE(),0),
(5,  N'Hoàng Minh Đức',     'duc.admin@shoppingapp.com',   '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0901000005',N'Admin dự phòng, kiểm thử.','ADMIN','ACTIVE',DATEADD(month,-8,GETDATE()),GETUTCDATE(),0),
-- MEMBER (45)
(6,  N'Nguyễn Thị Lan',     'lan.nguyen@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345601',N'Nội trợ, thích nấu ăn và quản lý bếp.','MEMBER','ACTIVE',DATEADD(month,-8,GETDATE()),GETUTCDATE(),0),
(7,  N'Trần Văn Bình',      'binh.tran@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345602',N'Kỹ sư phần mềm, hay đi chợ cuối tuần.','MEMBER','ACTIVE',DATEADD(month,-8,GETDATE()),GETUTCDATE(),0),
(8,  N'Lê Thị Thu',         'thu.le@gmail.com',            '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345603',N'Giáo viên, chú trọng ăn uống lành mạnh.','MEMBER','ACTIVE',DATEADD(month,-7,GETDATE()),GETUTCDATE(),0),
(9,  N'Phạm Quốc Huy',      'huy.pham@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345604',N'Sinh viên đại học, sống tự lập.','MEMBER','ACTIVE',DATEADD(month,-7,GETDATE()),GETUTCDATE(),0),
(10, N'Hoàng Thị Dung',     'dung.hoang@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345605',N'Bác sĩ dinh dưỡng, quan tâm calo.','MEMBER','ACTIVE',DATEADD(month,-7,GETDATE()),GETUTCDATE(),1),
(11, N'Vũ Minh Khoa',       'khoa.vu@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345606',N'Kế toán, quản lý chi tiêu chặt chẽ.','MEMBER','ACTIVE',DATEADD(month,-6,GETDATE()),GETUTCDATE(),0),
(12, N'Đặng Thị Hằng',      'hang.dang@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345607',N'Thiết kế đồ họa, thích ẩm thực sáng tạo.','MEMBER','ACTIVE',DATEADD(month,-6,GETDATE()),GETUTCDATE(),0),
(13, N'Bùi Văn Nam',        'nam.bui@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345608',N'Chủ tiệm tạp hóa, am hiểu giá cả.','MEMBER','ACTIVE',DATEADD(month,-6,GETDATE()),GETUTCDATE(),0),
(14, N'Ngô Thị Linh',       'linh.ngo@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345609',N'Nhân viên văn phòng, cần lên kế hoạch ăn.','MEMBER','ACTIVE',DATEADD(month,-5,GETDATE()),GETUTCDATE(),0),
(15, N'Đinh Quang Hải',     'hai.dinh@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345610',N'Huấn luyện viên thể dục, ăn kiêng nghiêm.','MEMBER','ACTIVE',DATEADD(month,-5,GETDATE()),GETUTCDATE(),0),
(16, N'Cao Thị Phương',     'phuong.cao@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345611',N'Kế toán gia đình, theo dõi ngân sách.','MEMBER','ACTIVE',DATEADD(month,-5,GETDATE()),GETUTCDATE(),0),
(17, N'Lý Văn Thành',       'thanh.ly@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345612',N'Lập trình viên, ưu tiên ăn nhanh.','MEMBER','ACTIVE',DATEADD(month,-4,GETDATE()),GETUTCDATE(),0),
(18, N'Mai Thị Ngọc',       'ngoc.mai@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345613',N'Y tá, ca kíp, cần lên kế hoạch trước.','MEMBER','ACTIVE',DATEADD(month,-4,GETDATE()),GETUTCDATE(),0),
(19, N'Tô Văn Long',        'long.to@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345614',N'Tài xế xe tải, ăn bên ngoài nhiều.','MEMBER','ACTIVE',DATEADD(month,-4,GETDATE()),GETUTCDATE(),0),
(20, N'Huỳnh Thị Kim',      'kim.huynh@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345615',N'Thợ may, thích nấu món truyền thống.','MEMBER','ACTIVE',DATEADD(month,-4,GETDATE()),GETUTCDATE(),0),
(21, N'Trương Văn Phúc',    'phuc.truong@gmail.com',       '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345616',N'Pha chế cà phê, sống một mình.','MEMBER','ACTIVE',DATEADD(month,-3,GETDATE()),GETUTCDATE(),0),
(22, N'Dương Thị Ánh',      'anh.duong@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345617',N'Sinh viên, thường nấu ăn tập thể.','MEMBER','ACTIVE',DATEADD(month,-3,GETDATE()),GETUTCDATE(),0),
(23, N'Hồ Văn Tài',         'tai.ho@gmail.com',            '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345618',N'Nhân viên bảo vệ, bữa ăn thất thường.','MEMBER','ACTIVE',DATEADD(month,-3,GETDATE()),GETUTCDATE(),0),
(24, N'Phan Thị Châu',      'chau.phan@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345619',N'Giáo viên mầm non, hay nấu cho con.','MEMBER','ACTIVE',DATEADD(month,-3,GETDATE()),GETUTCDATE(),0),
(25, N'Lâm Văn Sơn',        'son.lam@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345620',N'Thợ xây, cần ăn nhiều năng lượng.','MEMBER','ACTIVE',DATEADD(month,-2,GETDATE()),GETUTCDATE(),0),
(26, N'Trịnh Thị Mai',      'mai.trinh@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345621',N'Dược sĩ, ưu tiên thực phẩm sạch.','MEMBER','ACTIVE',DATEADD(month,-2,GETDATE()),GETUTCDATE(),0),
(27, N'Nguyễn Văn Đạt',     'dat.nguyen@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345622',N'Nhân viên kinh doanh, hay tiếp khách.','MEMBER','ACTIVE',DATEADD(month,-2,GETDATE()),GETUTCDATE(),0),
(28, N'Võ Thị Hiền',        'hien.vo@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345623',N'Nội trợ toàn thời gian, 3 con nhỏ.','MEMBER','ACTIVE',DATEADD(month,-2,GETDATE()),GETUTCDATE(),0),
(29, N'Đỗ Văn Minh',        'minh.do@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345624',N'Thợ sửa điện, ăn uống đơn giản.','MEMBER','ACTIVE',DATEADD(month,-2,GETDATE()),GETUTCDATE(),0),
(30, N'Lưu Thị Hoa',        'hoa.luu@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345625',N'Bán hàng online, hay đặt đồ ăn.','MEMBER','ACTIVE',DATEADD(month,-2,GETDATE()),GETUTCDATE(),0),
(31, N'Chu Văn Dũng',       'dung.chu@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345626',N'Công nhân nhà máy, ca ngày ca đêm.','MEMBER','ACTIVE',DATEADD(month,-1,GETDATE()),GETUTCDATE(),0),
(32, N'Tạ Thị Nhung',       'nhung.ta@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345627',N'Hộ lý bệnh viện, chăm sóc sức khỏe.','MEMBER','ACTIVE',DATEADD(month,-1,GETDATE()),GETUTCDATE(),0),
(33, N'Giang Văn Toàn',     'toan.giang@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345628',N'Tài xế công nghệ, ăn vội giữa ca.','MEMBER','ACTIVE',DATEADD(month,-1,GETDATE()),GETUTCDATE(),0),
(34, N'Thiều Thị Thúy',     'thuy.thieu@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345629',N'Nghỉ hưu, thích nấu ăn cho cháu.','MEMBER','ACTIVE',DATEADD(month,-1,GETDATE()),GETUTCDATE(),0),
(35, N'Kiều Văn Nghĩa',     'nghia.kieu@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345630',N'Thợ chụp ảnh, hay ăn ngoài.','MEMBER','ACTIVE',DATEADD(month,-1,GETDATE()),GETUTCDATE(),0),
(36, N'Đoàn Thị Thu',       'thu.doan@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345631',N'Nhân viên ngân hàng, ăn trưa văn phòng.','MEMBER','ACTIVE',DATEADD(day,-28,GETDATE()),GETUTCDATE(),0),
(37, N'Phùng Văn Tùng',     'tung.phung@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345632',N'Đầu bếp nhà hàng, rành nguyên liệu.','MEMBER','ACTIVE',DATEADD(day,-25,GETDATE()),GETUTCDATE(),0),
(38, N'La Thị Oanh',        'oanh.la@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345633',N'Sinh viên đi làm thêm, ngân sách eo hẹp.','MEMBER','ACTIVE',DATEADD(day,-22,GETDATE()),GETUTCDATE(),0),
(39, N'Mạc Văn Hưng',       'hung.mac@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345634',N'Kỹ thuật điện lạnh, ăn uống qua loa.','MEMBER','ACTIVE',DATEADD(day,-20,GETDATE()),GETUTCDATE(),0),
(40, N'Quách Thị Hồng',     'hong.quach@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345635',N'Quản lý chuỗi cửa hàng, bận rộn.','MEMBER','ACTIVE',DATEADD(day,-18,GETDATE()),GETUTCDATE(),0),
(41, N'Từ Văn Phong',       'phong.tu@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345636',N'Chuyên viên marketing, thích healthy.','MEMBER','ACTIVE',DATEADD(day,-15,GETDATE()),GETUTCDATE(),0),
(42, N'Hà Thị Yến',         'yen.ha@gmail.com',            '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345637',N'Nhân viên khách sạn, chăm chút ẩm thực.','MEMBER','ACTIVE',DATEADD(day,-14,GETDATE()),GETUTCDATE(),0),
(43, N'Lương Văn Khải',     'khai.luong@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345638',N'Thợ hàn, cần bữa ăn no bụng.','MEMBER','ACTIVE',DATEADD(day,-12,GETDATE()),GETUTCDATE(),0),
(44, N'Doãn Thị Diễm',      'diem.doan@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345639',N'Pha chế trà sữa, trẻ tuổi năng động.','MEMBER','ACTIVE',DATEADD(day,-10,GETDATE()),GETUTCDATE(),0),
(45, N'Nông Văn Chiến',     'chien.nong@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345640',N'Nông dân, tự cung cấp rau và gà.','MEMBER','ACTIVE',DATEADD(day,-9,GETDATE()),GETUTCDATE(),0),
(46, N'Bạch Thị Tuyết',     'tuyet.bach@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345641',N'Kế toán tư nhân, mẹ đơn thân.','MEMBER','ACTIVE',DATEADD(day,-8,GETDATE()),GETUTCDATE(),0),
(47, N'Thân Văn Hiếu',      'hieu.than@gmail.com',         '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345642',N'Chuyên viên HR, thích trà và bánh ngọt.','MEMBER','ACTIVE',DATEADD(day,-7,GETDATE()),GETUTCDATE(),0),
(48, N'Ứng Thị Bích',       'bich.ung@gmail.com',          '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345643',N'Giáo viên tiếng Anh, ăn chay thứ 7.','MEMBER','ACTIVE',DATEADD(day,-6,GETDATE()),GETUTCDATE(),0),
(49, N'Khương Văn Lộc',     'loc.khuong@gmail.com',        '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345644',N'Kỹ sư cơ khí, thích nấu BBQ.','MEMBER','ACTIVE',DATEADD(day,-5,GETDATE()),GETUTCDATE(),0),
-- Edge cases
(50, N'Mã Thị Diệu',        'dieu.ma@gmail.com',           '$2b$10$mdUBG9zFDFS1oEYYbgS3GOT4PufSGzKvWhxaBfxUo/bWbbxkz9Fx6','0912345645',N'Tài khoản bị khóa.','MEMBER','LOCKED',DATEADD(day,-4,GETDATE()),GETUTCDATE(),0);
SET IDENTITY_INSERT NguoiDung OFF;
GO

-- ================================================================
-- SECTION 3: NHÓM GIA ĐÌNH (15 groups)
-- ================================================================
SET IDENTITY_INSERT NhomGiaDinh ON;
INSERT INTO NhomGiaDinh (MaNhom, TenNhom, TruongNhom, NgayTao, MaxThanhVien, MoTa, IsDeleted)
VALUES
(1,  N'Gia đình Nguyễn – Hà Nội',         6,  DATEADD(month,-8,GETDATE()),  6,  N'Gia đình 4 người, 2 con nhỏ, sống ở Hà Nội.', 0),
(2,  N'Nhà của anh Khoa',                 10,  DATEADD(month,-7,GETDATE()),  4,  N'Vợ chồng trẻ, thích theo dõi chi tiêu.', 0),
(3,  N'Team sinh viên Bách Khoa',          9,  DATEADD(month,-7,GETDATE()),  8,  N'4 sinh viên ở chung phòng trọ, chia nhau đi chợ.', 0),
(4,  N'Gia đình Lý – TP.HCM',            17,  DATEADD(month,-6,GETDATE()),  5,  N'Gia đình 3 thế hệ, bà nội thường nấu ăn.', 0),
(5,  N'Hội những người thích nấu ăn',    25,  DATEADD(month,-5,GETDATE()), 10,  N'Nhóm bạn bè chung sở thích ẩm thực.', 0),
(6,  N'Gia đình Nguyễn Đạt',             27,  DATEADD(month,-4,GETDATE()),  5,  N'Vợ chồng và con gái 5 tuổi.', 0),
(7,  N'Phòng trọ Thủ Đức',              31,  DATEADD(month,-3,GETDATE()),  6,  N'Công nhân và sinh viên ở chung, chia tiền chợ.', 0),
(8,  N'Gia đình bà Thúy',               34,  DATEADD(month,-3,GETDATE()),  5,  N'Ông bà nghỉ hưu, hay nấu cho cháu.', 0),
(9,  N'Nhà chị Thu Đoàn',               36,  DATEADD(month,-2,GETDATE()),  3,  N'Chị em gái 3 người sống chung.', 0),
(10, N'Nhóm đầu bếp nghiệp dư',         40,  DATEADD(month,-2,GETDATE()),  6,  N'Bạn bè cơ quan tụ tập nấu ăn cuối tuần.', 0),
(11, N'Gia đình Mạc – Đồng Nai',        39,  DATEADD(month,-2,GETDATE()),  4,  N'Gia đình 2 con, chuyển về Đồng Nai.', 0),
(12, N'Nhóm Healthy Eaters',            42,  DATEADD(day,-30,GETDATE()),   6,  N'Ăn uống lành mạnh, đếm calo hàng ngày.', 0),
(13, N'Gia đình Nông Văn Chiến',        45,  DATEADD(day,-25,GETDATE()),   3,  N'Nông dân, tự cung cấp rau và gà tươi.', 0),
(14, N'Nhà anh Hiếu',                   47,  DATEADD(day,-20,GETDATE()),   4,  N'Gia đình trẻ vừa mua nhà mới.', 0),
(15, N'Góc bếp của Lộc',                49,  DATEADD(day,-15,GETDATE()),   2,  N'Sống với người bạn thân, thích nấu BBQ cuối tuần.', 0);
SET IDENTITY_INSERT NhomGiaDinh OFF;
GO

-- ================================================================
-- SECTION 4: THÀNH VIÊN NHÓM (46 records)
-- ================================================================
INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro, NgayThamGia)
VALUES
-- Nhóm 1 (Leader: Lan/6)
(1, 6,  'LEADER', DATEADD(month,-8,GETDATE())),
(1, 7,  'MEMBER', DATEADD(month,-8,GETDATE())),
(1, 8,  'MEMBER', DATEADD(month,-7,GETDATE())),
-- Nhóm 2 (Leader: Dung/10)
(2, 10, 'LEADER', DATEADD(month,-7,GETDATE())),
(2, 11, 'MEMBER', DATEADD(month,-7,GETDATE())),
(2, 12, 'MEMBER', DATEADD(month,-6,GETDATE())),
-- Nhóm 3 (Leader: Huy/9)
(3, 9,  'LEADER', DATEADD(month,-7,GETDATE())),
(3, 21, 'MEMBER', DATEADD(month,-6,GETDATE())),
(3, 22, 'MEMBER', DATEADD(month,-6,GETDATE())),
(3, 23, 'MEMBER', DATEADD(month,-5,GETDATE())),
-- Nhóm 4 (Leader: Thành/17)
(4, 17, 'LEADER', DATEADD(month,-6,GETDATE())),
(4, 18, 'MEMBER', DATEADD(month,-6,GETDATE())),
(4, 16, 'VIEWER', DATEADD(month,-5,GETDATE())),
-- Nhóm 5 (Leader: Sơn/25)
(5, 25, 'LEADER', DATEADD(month,-5,GETDATE())),
(5, 26, 'MEMBER', DATEADD(month,-5,GETDATE())),
(5, 19, 'MEMBER', DATEADD(month,-4,GETDATE())),
(5, 20, 'MEMBER', DATEADD(month,-4,GETDATE())),
(5, 24, 'VIEWER', DATEADD(month,-3,GETDATE())),
-- Nhóm 6 (Leader: Đạt/27)
(6, 27, 'LEADER', DATEADD(month,-4,GETDATE())),
(6, 28, 'MEMBER', DATEADD(month,-4,GETDATE())),
(6, 29, 'MEMBER', DATEADD(month,-3,GETDATE())),
-- Nhóm 7 (Leader: Dũng/31)
(7, 31, 'LEADER', DATEADD(month,-3,GETDATE())),
(7, 32, 'MEMBER', DATEADD(month,-3,GETDATE())),
(7, 33, 'MEMBER', DATEADD(month,-3,GETDATE())),
(7, 38, 'MEMBER', DATEADD(month,-2,GETDATE())),
-- Nhóm 8 (Leader: Thúy/34)
(8, 34, 'LEADER', DATEADD(month,-3,GETDATE())),
(8, 35, 'MEMBER', DATEADD(month,-3,GETDATE())),
(8, 13, 'MEMBER', DATEADD(month,-2,GETDATE())),
-- Nhóm 9 (Leader: Thu/36)
(9, 36, 'LEADER', DATEADD(month,-2,GETDATE())),
(9, 15, 'MEMBER', DATEADD(month,-2,GETDATE())),
-- Nhóm 10 (Leader: Hồng/40)
(10, 40, 'LEADER', DATEADD(month,-2,GETDATE())),
(10, 41, 'MEMBER', DATEADD(month,-2,GETDATE())),
(10, 37, 'MEMBER', DATEADD(month,-1,GETDATE())),
-- Nhóm 11 (Leader: Hưng/39)
(11, 39, 'LEADER', DATEADD(month,-2,GETDATE())),
(11, 43, 'MEMBER', DATEADD(month,-2,GETDATE())),
(11, 44, 'MEMBER', DATEADD(month,-1,GETDATE())),
-- Nhóm 12 (Leader: Yến/42)
(12, 42, 'LEADER', DATEADD(day,-30,GETDATE())),
(12, 14, 'MEMBER', DATEADD(day,-28,GETDATE())),
-- Nhóm 13 (Leader: Chiến/45)
(13, 45, 'LEADER', DATEADD(day,-25,GETDATE())),
(13, 46, 'MEMBER', DATEADD(day,-23,GETDATE())),
-- Nhóm 14 (Leader: Hiếu/47)
(14, 47, 'LEADER', DATEADD(day,-20,GETDATE())),
(14, 48, 'MEMBER', DATEADD(day,-18,GETDATE())),
-- Nhóm 15 (Leader: Lộc/49)
(15, 49, 'LEADER', DATEADD(day,-15,GETDATE())),
(15, 30, 'MEMBER', DATEADD(day,-10,GETDATE()));
GO

-- ================================================================
-- SECTION 5: FAMILY INVITES (15 mã mời)
-- ================================================================
INSERT INTO FamilyInvites (Id, MaNhom, Code, TaoBoiId, MaxUses, UsedCount, ExpiresAt, IsDeleted)
VALUES
(NEWID(), 1,  'GD01ABCD', 6,  10, 3, DATEADD(day, 30, GETDATE()), 0),
(NEWID(), 2,  'KH02WXYZ', 10, 5,  1, DATEADD(day, 15, GETDATE()), 0),
(NEWID(), 3,  'SV03QRST', 9,  8,  4, DATEADD(day, 7,  GETDATE()), 0),
(NEWID(), 4,  'LY04MNOP', 17, 5,  2, DATEADD(day, 20, GETDATE()), 0),
(NEWID(), 5,  'NA05EFGH', 25, 10, 5, DATEADD(day, 45, GETDATE()), 0),
(NEWID(), 6,  'GD06IJKL', 27, 4,  2, DATEADD(day, 14, GETDATE()), 0),
(NEWID(), 7,  'PT07UVWX', 31, 6,  4, DATEADD(day, 5,  GETDATE()), 0),
(NEWID(), 8,  'GT08BCDE', 34, 5,  1, DATEADD(day, 60, GETDATE()), 0),
(NEWID(), 9,  'NT09FGHI', 36, 3,  2, DATEADD(day, 10, GETDATE()), 0),
(NEWID(), 10, 'DB10JKLM', 40, 6,  3, DATEADD(day, 21, GETDATE()), 0),
-- Expired invites (edge case)
(NEWID(), 1,  'OLD1ZZZZ', 6,  5,  5, DATEADD(day,-10, GETDATE()), 0),
(NEWID(), 2,  'OLD2YYYY', 10, 3,  0, DATEADD(day,-5,  GETDATE()), 0),
-- Deleted invite (soft delete)
(NEWID(), 3,  'DEL3XXXX', 9,  5,  1, DATEADD(day, 30, GETDATE()), 1),
(NEWID(), 11, 'MG11NOPQ', 39, 4,  0, DATEADD(day, 30, GETDATE()), 0),
(NEWID(), 12, 'HL12RSTU', 42, 6,  1, DATEADD(day, 25, GETDATE()), 0);
GO

-- ================================================================
-- SECTION 6: FAMILY NOTIFICATIONS (30 entries)
-- ================================================================
INSERT INTO FamilyNotifications (MaNhom, NoiDung, Loai, NgayTao)
VALUES
(1, N'Nguyễn Thị Lan đã tạo nhóm Gia đình Nguyễn – Hà Nội.', 'JOIN', DATEADD(month,-8,GETDATE())),
(1, N'Trần Văn Bình đã tham gia nhóm.', 'JOIN', DATEADD(month,-8,GETDATE())),
(1, N'Lê Thị Thu đã tham gia nhóm.', 'JOIN', DATEADD(month,-7,GETDATE())),
(1, N'Thông tin nhóm đã được cập nhật bởi Nguyễn Thị Lan.', 'INFO_UPDATE', DATEADD(month,-3,GETDATE())),
(2, N'Hoàng Thị Dung đã tạo nhóm Nhà của anh Khoa.', 'JOIN', DATEADD(month,-7,GETDATE())),
(2, N'Vũ Minh Khoa đã tham gia nhóm.', 'JOIN', DATEADD(month,-7,GETDATE())),
(2, N'Đặng Thị Hằng đã tham gia nhóm.', 'JOIN', DATEADD(month,-6,GETDATE())),
(3, N'Phạm Quốc Huy đã tạo nhóm Team sinh viên Bách Khoa.', 'JOIN', DATEADD(month,-7,GETDATE())),
(3, N'Trương Văn Phúc đã tham gia nhóm.', 'JOIN', DATEADD(month,-6,GETDATE())),
(3, N'Dương Thị Ánh đã tham gia nhóm.', 'JOIN', DATEADD(month,-6,GETDATE())),
(3, N'Hồ Văn Tài đã tham gia nhóm.', 'JOIN', DATEADD(month,-5,GETDATE())),
(4, N'Lý Văn Thành đã tạo nhóm Gia đình Lý – TP.HCM.', 'JOIN', DATEADD(month,-6,GETDATE())),
(4, N'Mai Thị Ngọc đã tham gia nhóm.', 'JOIN', DATEADD(month,-6,GETDATE())),
(5, N'Lâm Văn Sơn đã tạo nhóm Hội những người thích nấu ăn.', 'JOIN', DATEADD(month,-5,GETDATE())),
(5, N'Tô Văn Long đã tham gia nhóm.', 'JOIN', DATEADD(month,-4,GETDATE())),
(5, N'Huỳnh Thị Kim đã tham gia nhóm.', 'JOIN', DATEADD(month,-4,GETDATE())),
(6, N'Nguyễn Văn Đạt đã tạo nhóm Gia đình Nguyễn Đạt.', 'JOIN', DATEADD(month,-4,GETDATE())),
(6, N'Võ Thị Hiền đã tham gia nhóm.', 'JOIN', DATEADD(month,-4,GETDATE())),
(7, N'Chu Văn Dũng đã tạo nhóm Phòng trọ Thủ Đức.', 'JOIN', DATEADD(month,-3,GETDATE())),
(7, N'Tạ Thị Nhung đã tham gia nhóm.', 'JOIN', DATEADD(month,-3,GETDATE())),
(7, N'La Thị Oanh đã tham gia nhóm.', 'JOIN', DATEADD(month,-2,GETDATE())),
(8, N'Thiều Thị Thúy đã tạo nhóm Gia đình bà Thúy.', 'JOIN', DATEADD(month,-3,GETDATE())),
(8, N'Bùi Văn Nam đã tham gia nhóm.', 'JOIN', DATEADD(month,-2,GETDATE())),
(9, N'Đoàn Thị Thu đã tạo nhóm Nhà chị Thu Đoàn.', 'JOIN', DATEADD(month,-2,GETDATE())),
(10, N'Quách Thị Hồng đã tạo nhóm Nhóm đầu bếp nghiệp dư.', 'JOIN', DATEADD(month,-2,GETDATE())),
(10, N'Phùng Văn Tùng đã tham gia nhóm.', 'JOIN', DATEADD(month,-1,GETDATE())),
(11, N'Mạc Văn Hưng đã tạo nhóm Gia đình Mạc – Đồng Nai.', 'JOIN', DATEADD(month,-2,GETDATE())),
(12, N'Hà Thị Yến đã tạo nhóm Nhóm Healthy Eaters.', 'JOIN', DATEADD(day,-30,GETDATE())),
(13, N'Nông Văn Chiến đã tạo nhóm Gia đình Nông Văn Chiến.', 'JOIN', DATEADD(day,-25,GETDATE())),
(14, N'Thân Văn Hiếu đã tạo nhóm Nhà anh Hiếu.', 'JOIN', DATEADD(day,-20,GETDATE()));
GO

-- ================================================================
-- SECTION 7: CÔNG THỨC NẤU ĂN (35 system recipes, MaNhom=NULL)
-- ================================================================
INSERT INTO MonAn (TenMon, CongThuc, HuongDan, NgayTao, MaNhom, MaNguoiTao, ThoiGian, KhauPhan, DoKho, DanhMuc, MoTa, HinhAnh)
VALUES
-- MaMon 1
(N'Phở bò Hà Nội',
 N'Xương bò 1kg, thịt bò tái 500g, bánh phở 400g, hành tím 4 củ, gừng 100g, hoa hồi 3 cái, quế 1 thanh, nước mắm, muối, đường phèn',
 N'1. Nướng gừng và hành tím. 2. Ninh xương bò 4-6 tiếng với gia vị. 3. Trần bánh phở. 4. Thái thịt bò mỏng. 5. Chan nước dùng sôi vào bát. 6. Thêm hành, ngò và ớt.',
 DATEADD(month,-12,GETDATE()), NULL, 1, 240, 4, N'Khó', N'Món chính', N'Phở bò truyền thống Hà Nội với nước dùng đậm đà, thịt bò tươi ngon.', N'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400'),
-- MaMon 2
(N'Cơm tấm sườn bì chả',
 N'Sườn heo 500g, bì heo 300g, trứng 4 quả, cơm tấm 400g, nước mắm, đường, tỏi, ớt, sả',
 N'1. Ướp sườn với sả tỏi ớt nướng thơm. 2. Làm bì heo sệt. 3. Hấp chả trứng. 4. Nấu cơm tấm. 5. Bày đĩa với đồ chua, dưa leo.',
 DATEADD(month,-11,GETDATE()), NULL, 1, 45, 4, N'Trung bình', N'Món chính', N'Cơm tấm sài gòn đặc trưng với sườn nướng thơm lừng.', N'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400'),
-- MaMon 3
(N'Bún bò Huế',
 N'Bắp bò 500g, giò heo 1 cái, bún 400g, sả 4 cây, mắm ruốc 2 muỗng, ớt, hành tím, màu điều',
 N'1. Ninh xương và giò heo. 2. Phi sả và mắm ruốc. 3. Nêm màu điều cho đỏ đẹp. 4. Thái bắp bò. 5. Chan nước dùng vào bún.',
 DATEADD(month,-11,GETDATE()), NULL, 2, 90, 4, N'Trung bình', N'Món chính', N'Bún bò Huế cay nồng đậm đà hương vị miền Trung.', N'https://images.unsplash.com/photo-1569900514868-abb2f85e85d6?w=400'),
-- MaMon 4
(N'Canh chua cá lóc',
 N'Cá lóc 600g, cà chua 3 quả, dứa 1/4 quả, giá đỗ 100g, bạc hà 100g, me 50g, ngò gai, hành, nước mắm, đường',
 N'1. Nấu nước me chua. 2. Cho cà chua và dứa vào. 3. Thêm cá lóc đã làm sạch. 4. Nêm gia vị chua cay ngọt. 5. Cho giá và bạc hà vào cuối.',
 DATEADD(month,-10,GETDATE()), NULL, 3, 30, 2, N'Dễ', N'Món chính', N'Canh chua cá lóc miền Nam mát lành, cân bằng vị chua ngọt cay.', N'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400'),
-- MaMon 5
(N'Thịt kho tàu',
 N'Thịt ba rọi 700g, trứng vịt 6 quả, nước dừa tươi 500ml, nước mắm, đường, tỏi, hành tím',
 N'1. Ướp thịt với gia vị 30 phút. 2. Thắng đường làm màu caramen. 3. Cho thịt vào xào đến vàng. 4. Đổ nước dừa và kho lửa nhỏ 45 phút. 5. Cho trứng luộc vào kho thêm 15 phút.',
 DATEADD(month,-10,GETDATE()), NULL, 1, 60, 4, N'Dễ', N'Món chính', N'Thịt kho tàu đậm đà, mềm thơm, ăn cùng cơm trắng.', N'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400'),
-- MaMon 6
(N'Gà kho gừng',
 N'Gà ta 1 con, gừng tươi 100g, sả 2 cây, hành tím, nước mắm, đường, tiêu',
 N'1. Chặt gà, ướp gừng sả nước mắm 20 phút. 2. Xào sơ trên lửa lớn. 3. Kho liu riu đến khi nước sệt lại. 4. Nêm thêm tiêu và hành lá.',
 DATEADD(month,-9,GETDATE()), NULL, 1, 40, 4, N'Dễ', N'Món chính', N'Gà kho gừng ấm áp, phù hợp ngày mưa lạnh.', N'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400'),
-- MaMon 7
(N'Cá hồi nướng miso',
 N'Cá hồi 400g, miso 2 muỗng, mirin 1 muỗng, dầu mè, hành lá, vừng rang',
 N'1. Ướp cá hồi với miso mirin 1 tiếng. 2. Nướng ở 200°C trong 15 phút. 3. Rắc vừng và hành lá. 4. Ăn với cơm trắng và salad.',
 DATEADD(month,-9,GETDATE()), NULL, 3, 25, 2, N'Dễ', N'Món chính', N'Cá hồi nướng miso phong cách Nhật, thơm béo và bổ dưỡng.', N'https://images.unsplash.com/photo-1567360425618-1594206637d2?w=400'),
-- MaMon 8
(N'Bò lúc lắc',
 N'Thịt bò thăn 500g, ớt chuông 2 trái, hành tây 1 củ, dầu hào, nước mắm, tỏi, tiêu, dầu ăn',
 N'1. Ướp bò với dầu hào tỏi tiêu 30 phút. 2. Xào ớt chuông hành tây sơ qua. 3. Xào bò lửa lớn đảo nhanh. 4. Trộn đều, nêm gia vị. 5. Ăn với cơm trắng hoặc bánh mì.',
 DATEADD(month,-8,GETDATE()), NULL, 1, 20, 2, N'Dễ', N'Món chính', N'Bò lúc lắc thơm ngon, thịt mềm dai vừa phải.', N'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
-- MaMon 9
(N'Tôm rang muối',
 N'Tôm sú 500g, muối, tỏi, ớt, chanh, bơ, dầu ăn',
 N'1. Rửa tôm để ráo, khía lưng. 2. Phi tỏi ớt cho thơm. 3. Cho tôm vào xào lửa lớn. 4. Rắc muối rang đảo đều. 5. Vắt chanh và cho bơ vào sau cùng.',
 DATEADD(month,-8,GETDATE()), NULL, 2, 20, 2, N'Dễ', N'Món chính', N'Tôm rang muối giòn thơm, hấp dẫn cả nhà.', N'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400'),
-- MaMon 10
(N'Canh rau ngót thịt bằm',
 N'Rau ngót 200g, thịt heo bằm 200g, tỏi, nước mắm, muối, hành lá',
 N'1. Xào thịt bằm với tỏi. 2. Đổ nước vào nấu sôi. 3. Cho rau ngót vào, nêm nước mắm muối. 4. Nấu thêm 3 phút. 5. Cho hành lá vào tắt bếp.',
 DATEADD(month,-7,GETDATE()), NULL, 2, 20, 4, N'Dễ', N'Món chính', N'Canh rau ngót thịt bằm thanh mát, bổ dưỡng cho bữa cơm gia đình.', NULL),
-- MaMon 11
(N'Rau muống xào tỏi',
 N'Rau muống 500g, tỏi 5 tép, dầu ăn, nước mắm, muối, đường',
 N'1. Nhặt rau muống rửa sạch. 2. Phi tỏi vàng thơm. 3. Cho rau vào xào lửa lớn đảo nhanh. 4. Nêm nước mắm muối đường. 5. Đảo thêm 1 phút rồi tắt bếp.',
 DATEADD(month,-7,GETDATE()), NULL, 2, 10, 4, N'Dễ', N'Món chính', N'Rau muống xào tỏi đơn giản ngon miệng, không thể thiếu trong bữa cơm Việt.', NULL),
-- MaMon 12
(N'Trứng chiên cà chua',
 N'Trứng gà 4 quả, cà chua 3 quả, hành lá, dầu ăn, nước mắm, muối, đường',
 N'1. Đánh trứng với chút muối. 2. Chiên trứng vàng, gỡ ra. 3. Phi hành rồi xào cà chua. 4. Cho trứng vào, nêm gia vị. 5. Rắc hành lá lên.',
 DATEADD(month,-7,GETDATE()), NULL, 1, 15, 4, N'Dễ', N'Món chính', N'Trứng chiên cà chua quen thuộc, nhanh gọn dễ làm.', NULL),
-- MaMon 13
(N'Canh bí đao nấu tôm',
 N'Bí đao 500g, tôm tươi 200g, hành lá, dầu ăn, nước mắm, muối',
 N'1. Bí đao gọt vỏ thái miếng. 2. Xào tôm sơ qua. 3. Đổ nước nấu sôi, cho bí đao vào. 4. Nêm gia vị. 5. Cho hành lá vào tắt bếp.',
 DATEADD(month,-6,GETDATE()), NULL, 2, 20, 4, N'Dễ', N'Món chính', N'Canh bí đao tôm thanh mát, giải nhiệt ngày nóng.', NULL),
-- MaMon 14
(N'Gỏi cuốn tôm thịt',
 N'Tôm luộc 200g, thịt ba rọi luộc 200g, bánh tráng 20 tờ, bún 200g, rau sống tổng hợp, tương hoisin, đậu phộng rang',
 N'1. Luộc tôm và thịt ba rọi. 2. Trần bún. 3. Nhúng bánh tráng vào nước ấm. 4. Cuốn các nguyên liệu vào bánh. 5. Chấm với tương hoisin pha đậu phộng.',
 DATEADD(month,-6,GETDATE()), NULL, 3, 45, 4, N'Trung bình', N'Khai vị', N'Gỏi cuốn tươi mát, thanh đạm đặc trưng ẩm thực miền Nam.', N'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400'),
-- MaMon 15
(N'Mì xào hải sản',
 N'Mì trứng 300g, tôm 150g, mực 150g, ớt chuông, nấm, hành tây, dầu hào, nước mắm, tỏi',
 N'1. Chần mì cho sơ. 2. Xào tỏi thơm, thêm hải sản. 3. Cho rau và nấm vào xào tiếp. 4. Cho mì vào, nêm dầu hào. 5. Đảo đều cho mì thấm.',
 DATEADD(month,-5,GETDATE()), NULL, 1, 25, 4, N'Trung bình', N'Món chính', N'Mì xào hải sản nhanh gọn, đủ chất cho bữa tối.', NULL),
-- MaMon 16
(N'Cháo gà',
 N'Gạo tẻ 200g, gà ta 1/2 con, gừng, hành tím, nước mắm, muối, hành lá, ngò rí',
 N'1. Ninh gà lấy nước dùng. 2. Vo gạo cho vào ninh cùng. 3. Nêm gia vị. 4. Xé thịt gà bỏ vào. 5. Múc ra bát, rắc hành và gừng thái sợi.',
 DATEADD(month,-5,GETDATE()), NULL, 1, 90, 4, N'Dễ', N'Món chính', N'Cháo gà ấm bụng, thích hợp ngày trời lạnh hoặc khi ốm mệt.', NULL),
-- MaMon 17
(N'Sườn xào chua ngọt',
 N'Sườn non 600g, ớt chuông, dứa, cà chua, giấm, đường, nước mắm, tỏi, gừng',
 N'1. Chiên sườn vàng giòn. 2. Làm nước xốt chua ngọt. 3. Cho ớt chuông dứa vào. 4. Trộn sườn vào xốt, đảo nhanh. 5. Thêm cà chua và nêm lại.',
 DATEADD(month,-5,GETDATE()), NULL, 2, 45, 4, N'Trung bình', N'Món chính', N'Sườn xào chua ngọt kích thích vị giác, cân bằng hương vị tuyệt vời.', NULL),
-- MaMon 18
(N'Đậu phụ sốt cà chua',
 N'Đậu phụ 400g, cà chua 3 quả, hành lá, tỏi, nước mắm, đường, dầu ăn',
 N'1. Chiên đậu phụ vàng đều. 2. Phi tỏi thơm, cho cà chua vào xào. 3. Nêm gia vị chua ngọt. 4. Cho đậu phụ vào đảo đều. 5. Rắc hành lá.',
 DATEADD(month,-4,GETDATE()), NULL, 2, 20, 4, N'Dễ', N'Món chính', N'Đậu phụ sốt cà chua chay lạt, dễ làm và ngon miệng.', NULL),
-- MaMon 19
(N'Cơm chiên dương châu',
 N'Cơm nguội 4 bát, trứng 3 quả, tôm 100g, lạp xưởng 1 cây, ngô, đậu hà lan, hành lá, nước mắm, dầu ăn',
 N'1. Xào trứng tan. 2. Cho tôm và lạp xưởng vào xào. 3. Cho cơm vào đảo tơi. 4. Cho ngô và đậu hà lan vào. 5. Nêm gia vị, rắc hành lá.',
 DATEADD(month,-4,GETDATE()), NULL, 1, 20, 4, N'Dễ', N'Món chính', N'Cơm chiên dương châu đủ màu sắc, dễ ăn và nhanh chóng.', NULL),
-- MaMon 20
(N'Salad gà caesar',
 N'Ức gà 300g, rau xà lách romaine, bánh mì crouton, phô mai parmesan, nước sốt caesar',
 N'1. Nướng ức gà với tiêu muối. 2. Thái gà mỏng. 3. Trộn rau với nước sốt caesar. 4. Thêm crouton và gà. 5. Rắc phô mai bào và tiêu xay.',
 DATEADD(month,-4,GETDATE()), NULL, 3, 20, 4, N'Dễ', N'Khai vị', N'Salad caesar tươi mát, bổ dưỡng và ít calo.', N'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400'),
-- MaMon 21
(N'Chả giò chiên',
 N'Thịt heo bằm 300g, miến 50g, nấm mèo 30g, cà rốt 1 củ, hành tây 1/2 củ, trứng 1 quả, bánh tráng, dầu chiên',
 N'1. Trộn nhân thịt với rau củ và gia vị. 2. Cuốn chả giò chặt tay. 3. Chiên dầu lửa vừa đến vàng đều. 4. Vớt ra thấm dầu. 5. Ăn với rau sống và nước chấm.',
 DATEADD(month,-3,GETDATE()), NULL, 2, 60, 4, N'Trung bình', N'Khai vị', N'Chả giò vàng giòn, nhân thơm đậm đà khó cưỡng.', NULL),
-- MaMon 22
(N'Bún chả Hà Nội',
 N'Thịt ba rọi 400g, chả viên 300g, bún 400g, nước chấm, dưa góp, rau sống, tỏi ớt',
 N'1. Ướp thịt và chả. 2. Nướng than hoặc nồi nướng. 3. Pha nước chấm chua ngọt. 4. Làm dưa góp ăn kèm. 5. Bày bún và rau sống ra ăn cùng.',
 DATEADD(month,-3,GETDATE()), NULL, 1, 50, 4, N'Trung bình', N'Món chính', N'Bún chả Hà Nội thơm lừng khói nướng, hương vị Bắc cổ điển.', N'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400'),
-- MaMon 23
(N'Canh mướp nấu tôm',
 N'Mướp 2 quả, tôm tươi 150g, hành lá, dầu ăn, nước mắm, muối',
 N'1. Gọt mướp thái khúc. 2. Xào tôm sơ. 3. Đổ nước nấu sôi, cho mướp vào. 4. Nêm gia vị nhẹ. 5. Cho hành lá và tắt bếp.',
 DATEADD(month,-3,GETDATE()), NULL, 2, 15, 4, N'Dễ', N'Món chính', N'Canh mướp tôm ngọt thanh, mát lành dễ ăn.', NULL),
-- MaMon 24
(N'Khoai lang chiên',
 N'Khoai lang 500g, dầu chiên, muối',
 N'1. Gọt vỏ khoai lang, thái que. 2. Ngâm nước muối 15 phút. 3. Thấm khô. 4. Chiên ngập dầu đến vàng giòn. 5. Thấm dầu, rắc muối.',
 DATEADD(month,-2,GETDATE()), NULL, 2, 20, 4, N'Dễ', N'Ăn nhẹ', N'Khoai lang chiên giòn ngọt tự nhiên, món ăn vặt lý tưởng.', NULL),
-- MaMon 25
(N'Bắp rang bơ',
 N'Bắp khô 100g, bơ 30g, muối, đường, caramel tùy chọn',
 N'1. Đun bơ chảy trong nồi dày. 2. Cho bắp vào, đậy nắp. 3. Lắc đều khi nghe nổ. 4. Tắt bếp khi tiếng nổ giảm. 5. Rắc muối và đường theo khẩu vị.',
 DATEADD(month,-2,GETDATE()), NULL, 2, 10, 4, N'Dễ', N'Ăn nhẹ', N'Bắp rang bơ thơm béo, ăn vặt lý tưởng cho cả nhà.', NULL),
-- MaMon 26
(N'Nộm dưa chuột cà rốt',
 N'Dưa chuột 3 quả, cà rốt 2 củ, tôm khô, lạc rang, tỏi ớt, giấm, đường, nước mắm',
 N'1. Thái dưa chuột và cà rốt sợi mỏng. 2. Muối sơ, vắt bỏ nước. 3. Ngâm tôm khô. 4. Trộn gia vị chua ngọt. 5. Rắc lạc rang và tôm khô.',
 DATEADD(month,-2,GETDATE()), NULL, 2, 15, 4, N'Dễ', N'Khai vị', N'Nộm giòn ngon, chua cay ngọt kích thích vị giác.', NULL),
-- MaMon 27
(N'Cải thảo xào thịt bò',
 N'Cải thảo 1 cây, thịt bò 300g, tỏi, dầu hào, nước mắm, dầu ăn, tiêu',
 N'1. Ướp thịt bò với dầu hào tiêu. 2. Xào thịt bò lửa lớn, gỡ ra. 3. Phi tỏi, cho cải thảo vào xào. 4. Cho thịt bò vào trộn đều. 5. Nêm lại gia vị.',
 DATEADD(month,-1,GETDATE()), NULL, 1, 15, 4, N'Dễ', N'Món chính', N'Cải thảo xào thịt bò đơn giản mà đậm đà.', NULL),
-- MaMon 28
(N'Canh cải bẹ nấu thịt',
 N'Cải bẹ xanh 300g, thịt heo 200g, tỏi, nước mắm, muối',
 N'1. Luộc thịt sơ, thái miếng. 2. Nấu nước dùng. 3. Cho cải bẹ vào nấu mềm. 4. Cho thịt vào, nêm gia vị. 5. Múc ra bát ăn nóng.',
 DATEADD(month,-1,GETDATE()), NULL, 2, 25, 4, N'Dễ', N'Món chính', N'Canh cải bẹ nấu thịt thanh đạm, bổ dưỡng tốt cho tiêu hóa.', NULL),
-- MaMon 29
(N'Tôm hấp sả',
 N'Tôm sú 500g, sả 4 cây, ớt, tỏi, bia hoặc nước lọc',
 N'1. Rửa tôm để nguyên. 2. Đập dập sả lót đáy nồi. 3. Xếp tôm lên, cho bia vào. 4. Hấp 8-10 phút đến khi tôm chín đỏ. 5. Ăn với muối tiêu chanh.',
 DATEADD(day,-20,GETDATE()), NULL, 2, 20, 4, N'Dễ', N'Món chính', N'Tôm hấp sả thơm ngon, giữ trọn vị ngọt tự nhiên của tôm.', NULL),
-- MaMon 30
(N'Mực xào sả ớt',
 N'Mực ống 500g, sả 3 cây, ớt tươi, tỏi, nước mắm, dầu ăn',
 N'1. Làm sạch mực, khứa ô vuông. 2. Phi sả tỏi ớt cho thơm. 3. Cho mực vào xào lửa lớn. 4. Nêm nước mắm. 5. Đảo nhanh và tắt bếp.',
 DATEADD(day,-15,GETDATE()), NULL, 3, 20, 4, N'Trung bình', N'Món chính', N'Mực xào sả ớt cay thơm, dai giòn hấp dẫn.', NULL),
-- MaMon 31
(N'Ức gà nướng lemon',
 N'Ức gà 400g, chanh 1 quả, tỏi, rosemary, muối, tiêu, dầu olive',
 N'1. Ướp ức gà với chanh tỏi rosemary 2 tiếng. 2. Nướng ở 180°C trong 25 phút. 3. Để nghỉ 5 phút. 4. Thái lát mỏng. 5. Ăn với salad hoặc rau nướng.',
 DATEADD(day,-14,GETDATE()), NULL, 3, 25, 4, N'Dễ', N'Món chính', N'Ức gà nướng chanh thảo mộc nhẹ nhàng, healthy và ngon.', NULL),
-- MaMon 32
(N'Súp bí đỏ',
 N'Bí đỏ 600g, hành tây 1 củ, tỏi, nước dùng gà 500ml, kem tươi, muối, tiêu',
 N'1. Hầm bí đỏ và hành tây. 2. Xay mịn bằng máy xay. 3. Đun lại với nước dùng. 4. Cho kem vào, nêm gia vị. 5. Trang trí với hạt bí và kem.',
 DATEADD(day,-12,GETDATE()), NULL, 4, 35, 4, N'Dễ', N'Khai vị', N'Súp bí đỏ béo mượt, ấm lòng và đẹp mắt.', NULL),
-- MaMon 33
(N'Bánh xèo miền Nam',
 N'Bột gạo 200g, bột nghệ, nước cốt dừa, thịt ba rọi 200g, tôm 150g, giá đỗ, hành, dầu ăn',
 N'1. Pha bột với nước cốt dừa và nghệ. 2. Xào nhân thịt tôm. 3. Đổ bột vào chảo nóng dầu. 4. Cho nhân vào gấp đôi. 5. Chiên đến giòn vàng. 6. Ăn với rau sống.',
 DATEADD(day,-10,GETDATE()), NULL, 2, 45, 4, N'Trung bình', N'Món chính', N'Bánh xèo miền Nam giòn rụm, đậm đà hương vị quê nhà.', N'https://images.unsplash.com/photo-1617207563543-e3bc4c9e0e75?w=400'),
-- MaMon 34
(N'Lẩu thái hải sản',
 N'Tôm 300g, mực 200g, nghêu 300g, nấm kim châm 100g, cà chua, sả, lá chanh, ớt, me, nước lẩu thái',
 N'1. Nấu nước lẩu với sả, lá chanh, ớt. 2. Cho me vào nêm chua. 3. Bày rau và hải sản ra đĩa. 4. Nhúng hải sản vào lẩu. 5. Ăn cùng bún hoặc mì.',
 DATEADD(day,-8,GETDATE()), NULL, 4, 60, 4, N'Trung bình', N'Món chính', N'Lẩu thái hải sản chua cay nóng hổi, thích hợp tụ họp gia đình.', N'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400'),
-- MaMon 35
(N'Chè đậu xanh nước dừa',
 N'Đậu xanh cà vỏ 200g, đường 100g, nước cốt dừa 200ml, bột báng 50g, muối',
 N'1. Ngâm đậu xanh 2 tiếng, luộc chín. 2. Nấu nước đường. 3. Cho đậu vào nấu chín mềm. 4. Cho bột báng vào. 5. Chan nước cốt dừa và rắc muối.',
 DATEADD(day,-5,GETDATE()), NULL, 2, 40, 4, N'Dễ', N'Tráng miệng', N'Chè đậu xanh nước dừa thanh mát giải nhiệt ngày hè.', NULL);
GO

PRINT N'✅ Master seed hoàn tất: 50 users, 15 groups, 46 members, 15 invites, 30 notifications, 35 recipes';
GO
