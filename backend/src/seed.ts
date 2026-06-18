import sql from 'mssql';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const config: sql.config = {
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'shoppingdb',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    ...(process.env.DB_INSTANCE ? { instanceName: process.env.DB_INSTANCE } : {}),
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 120000, // 2 minutes request timeout for large inserts
};

// ---------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------
function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toAscii(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

const vnLastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const vnMiddleNames = ['Văn', 'Thị', 'Minh', 'Hồng', 'Tuấn', 'Đức', 'Khánh', 'Ngọc', 'Kim', 'Bảo', 'Hoài', 'Xuân', 'Gia', 'Hải'];
const vnFirstNames = ['Anh', 'Bình', 'Chi', 'Dũng', 'Em', 'Giang', 'Hương', 'Hải', 'Khoa', 'Linh', 'Minh', 'Nam', 'Oanh', 'Phúc', 'Quỳnh', 'Sơn', 'Trang', 'Tuấn', 'Vinh', 'Vy', 'Yến'];

const enLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee'];
const enFirstNames = ['John', 'Mary', 'James', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Elizabeth', 'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];

function generateName(isVn = true) {
  if (isVn) {
    return `${randChoice(vnLastNames)} ${randChoice(vnMiddleNames)} ${randChoice(vnFirstNames)}`;
  } else {
    return `${randChoice(enFirstNames)} ${randChoice(enLastNames)}`;
  }
}

// ---------------------------------------------------------------------
// FOOD DATABASE LISTS BY CATEGORY
// ---------------------------------------------------------------------
const foodCategories: Record<string, { items: string[]; unit: string[]; locations: string[] }> = {
  'Rau củ': {
    items: ['Cà chua', 'Xà lách', 'Rau muống', 'Cải thìa', 'Bắp cải', 'Củ cải trắng', 'Cà rốt', 'Bông cải xanh', 'Khoai tây', 'Khoai lang', 'Hành tây', 'Tỏi Lý Sơn', 'Gừng tươi', 'Ớt hiểm', 'Nấm kim châm', 'Bí đỏ', 'Măng tây'],
    unit: ['bó', 'kg', 'g', 'cái'],
    locations: ['Fridge', 'Pantry']
  },
  'Trái cây': {
    items: ['Táo đỏ', 'Chuối sứ', 'Cam sành', 'Xoài cát', 'Dưa hấu', 'Bơ sáp', 'Nho ngón tay', 'Dâu tây Đà Lạt', 'Cherry Mỹ', 'Bưởi da xanh', 'Đu đủ chín', 'Sầu riêng Ri6', 'Măng cụt', 'Nhãn xuồng', 'Vải thiều'],
    unit: ['kg', 'quả', 'hộp'],
    locations: ['Fridge']
  },
  'Thịt': {
    items: ['Thịt ba rọi heo', 'Sườn non heo', 'Thịt đùi heo', 'Thịt bò phi lê', 'Thịt ức gà', 'Đùi gà ta', 'Thịt vịt Huệ', 'Thịt dê núi', 'Bắp bò Mỹ', 'Nạc vai heo'],
    unit: ['kg', 'g'],
    locations: ['Freezer', 'Fridge']
  },
  'Hải sản': {
    items: ['Tôm thẻ chân trắng', 'Cá hồi phi lê', 'Cá lóc đồng', 'Mực ống Phú Quốc', 'Cua biển Cà Mau', 'Nghêu bến tre', 'Hàu sữa', 'Cá thu lát', 'Cá ngừ đại dương', 'Bạch tuộc'],
    unit: ['kg', 'g', 'con'],
    locations: ['Freezer']
  },
  'Sữa & Trứng': {
    items: ['Sữa tươi tiệt trùng Vinamilk', 'Sữa chua TH True Milk', 'Phô mai lát Cheddar', 'Bơ lạt Anchor', 'Trứng gà ta', 'Trứng vịt', 'Váng sữa Monte', 'Sữa đặc Ông Thọ'],
    unit: ['hộp', 'chai', 'quả', 'l', 'ml'],
    locations: ['Fridge']
  },
  'Đồ đông lạnh': {
    items: ['Cá viên chiên', 'Bò viên', 'Sủi cảo Cầu Tre', 'Khoai tây chiên McCain', 'Kem vani Merino', 'Pizza cấp đông', 'Xúc xích Đức', 'Chả giò tôm cua'],
    unit: ['gói', 'hộp', 'g'],
    locations: ['Freezer']
  },
  'Gia vị': {
    items: ['Nước mắm Phú Quốc', 'Muối i-ốt', 'Đường cát trắng', 'Bột ngọt Ajinomoto', 'Hạt nêm Knorr', 'Dầu ăn Simply', 'Tương ớt Chinsu', 'Tương cà', 'Tiêu đen xay', 'Dầu hào Lee Kum Kee'],
    unit: ['chai', 'gói', 'g', 'ml'],
    locations: ['Pantry']
  },
  'Đồ uống': {
    items: ['Nước khoáng La Vie', 'Nước ngọt Coca-cola', 'Bia Heineken', 'Trà xanh không độ', 'Nước ép cam đóng hộp', 'Cà phê Trung Nguyên', 'Sữa đậu nành Fami', 'Nước uống tăng lực Sting'],
    unit: ['lon', 'chai', 'thùng', 'l', 'ml'],
    locations: ['Pantry', 'Fridge']
  },
  'Đồ ăn vặt': {
    items: ['Bánh quy bơ Danisa', 'Khoai tây lát Lay\'s', 'Hạt điều rang muối', 'Kẹo dẻo Haribo', 'Bánh tráng trộn', 'Rong biển ăn liền', 'Khô bò sợi', 'Đậu phộng Tân Tân'],
    unit: ['gói', 'hộp', 'g'],
    locations: ['Pantry']
  },
  'Thực phẩm đóng hộp': {
    items: ['Cá hộp Ba Cô Gái', 'Thịt hộp Spam', 'Pate gan heo Hạ Long', 'Đậu đũa ngâm giấm', 'Ngô ngọt đóng hộp', 'Cháo sen bát bảo', 'Măng hộp'],
    unit: ['lon', 'hộp'],
    locations: ['Pantry']
  }
};

const categoriesKeys = Object.keys(foodCategories);

// ---------------------------------------------------------------------
// BATCH INSERTION EXECUTOR
// ---------------------------------------------------------------------
async function executeBatch(
  pool: sql.ConnectionPool,
  tableName: string,
  columns: string[],
  rows: any[],
  identityInsert = false
) {
  if (rows.length === 0) return;
  console.log(`🚀 Chèn ${rows.length} dòng vào bảng ${tableName}...`);

  if (identityInsert) {
    await pool.request().batch(`SET IDENTITY_INSERT ${tableName} ON`);
  }

  const batchSize = 300; // Safe batch size for SQL Server parameter/statement limit
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const valuesList = chunk.map(row => {
      const vals = columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === 'boolean') return val ? '1' : '0';
        if (typeof val === 'number') return val.toString();
        // Escape quotes and wrap with N'' for Unicode NVARCHAR fields
        return `N'${val.toString().replace(/'/g, "''")}'`;
      });
      return `(${vals.join(', ')})`;
    });

    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${valuesList.join(',\n')}`;
    await pool.request().batch(query);
  }

  if (identityInsert) {
    await pool.request().batch(`SET IDENTITY_INSERT ${tableName} OFF`);
  }
  console.log(`   └─ Thành công.`);
}

// ---------------------------------------------------------------------
// MAIN RUN METHOD
// ---------------------------------------------------------------------
async function runSeeder() {
  console.log('🔄 Bắt đầu tiến trình sinh dữ liệu và nạp database (Scale Seeding)...');
  let pool: sql.ConnectionPool | null = null;
  
  try {
    pool = await sql.connect(config);
    console.log(`✅ Kết nối thành công tới database: ${config.database}`);

    // =================================================================
    // STEP 1: XÓA SẠCH DỮ LIỆU CŨ THEO THỨ TỰ THƯỢNG NGUỒN -> HẠ NGUỒN
    // =================================================================
    console.log('🧹 Đang dọn dẹp các bảng dữ liệu cũ...');
    const tablesToDelete = [
      'AuditLogs',
      'BaoCaoChiTieu',
      'KeHoachBuaAn',
      'NguyenLieuMon',
      'MonAn',
      'NhatKyKho',
      'KhoThucPham',
      'ChiTietMuaSam',
      'DanhSachMuaSam',
      'FamilyInvites',
      'FamilyNotifications',
      'ThanhVienNhom',
      'NhomGiaDinh',
      'NguoiDung'
    ];
    for (const table of tablesToDelete) {
      await pool.request().batch(`DELETE FROM ${table}`);
      console.log(`   - Đã xóa sạch dữ liệu bảng ${table}`);
    }
    console.log('✅ Hệ thống database đã được đưa về trạng thái trống hoàn toàn.');

    // =================================================================
    // STEP 2: BĂM MẬT KHẨU MẪU (Tối ưu hóa performance)
    // =================================================================
    console.log('🔑 Đang băm mật khẩu mẫu "123456789"...');
    const salt = bcrypt.genSaltSync(10);
    const pwdHash = bcrypt.hashSync('123456789', salt);
    console.log('✅ Băm thành công (Tái sử dụng hash để tăng tốc seeding 50x lần).');

    // =================================================================
    // STEP 3: SINH NGUOI DUNG (1,050 users: 15 Admins, 1000 Members, 35 Edges)
    // =================================================================
    console.log('👤 Đang lập danh sách 1,050 người dùng...');
    const users: any[] = [];
    
    // 15 Admins
    for (let i = 1; i <= 15; i++) {
      const isVn = i % 3 !== 0;
      const name = generateName(isVn);
      const email = `${toAscii(name)}${i}@shopping.com`;
      const roleName = i <= 5 ? 'Super Admin' : i <= 10 ? 'Admin' : 'Moderator';
      
      users.push({
        MaNguoiDung: i,
        HoTen: `${name} (${roleName})`,
        Email: email,
        MatKhauHash: pwdHash,
        SoDienThoai: `09${randInt(10000000, 99999999)}`,
        Bio: `Tài khoản Quản trị viên điều phối - Cấp bậc ${roleName}`,
        VaiTro: 'ADMIN',
        TrangThai: 'ACTIVE',
        NgayTao: new Date(Date.now() - randInt(60, 180) * 24 * 3600 * 1000)
      });
    }

    // 1,000 Members & 35 Edge cases
    const totalMembers = 1035;
    for (let i = 16; i <= 16 + totalMembers; i++) {
      const isVn = Math.random() < 0.75; // 75% Vietnamese, 25% English
      const name = generateName(isVn);
      const email = `${toAscii(name)}${i}@gmail.com`;
      
      // Determine user persona profile
      let bio = 'Thành viên hệ thống quản lý kho gia đình';
      const randPersona = Math.random();
      if (randPersona < 0.2) bio = 'Sinh viên ở ghép tiết kiệm, thích ăn uống tự nấu';
      else if (randPersona < 0.4) bio = 'Nhân viên văn phòng bận rộn, chỉ chuẩn bị đồ ăn cuối tuần';
      else if (randPersona < 0.6) bio = 'Người nội trợ gia đình lớn, chăm sóc bếp lò chu đáo';
      else if (randPersona < 0.8) bio = 'Gymer siết cơ, chế độ ăn EatClean tập luyện nghiêm khắc';
      else if (randPersona < 0.9) bio = 'Người sống độc thân tối giản, tối ưu đồ ăn tránh lãng phí';
      
      // Edge cases: some locked/deleted
      let trangThai = 'ACTIVE';
      if (i > 1030) {
        trangThai = Math.random() > 0.5 ? 'LOCKED' : 'DELETED';
        bio = `[Tài khoản kiểm thử - Trạng thái: ${trangThai}]`;
      }

      users.push({
        MaNguoiDung: i,
        HoTen: name,
        Email: email,
        MatKhauHash: pwdHash,
        SoDienThoai: `0${randChoice(['9', '3', '7', '8'])}${randInt(10000000, 99999999)}`,
        Bio: bio,
        VaiTro: 'MEMBER',
        TrangThai: trangThai,
        NgayTao: new Date(Date.now() - randInt(5, 120) * 24 * 3600 * 1000)
      });
    }

    await executeBatch(
      pool,
      'NguoiDung',
      ['MaNguoiDung', 'HoTen', 'Email', 'MatKhauHash', 'SoDienThoai', 'Bio', 'VaiTro', 'TrangThai', 'NgayTao'],
      users,
      true
    );

    // =================================================================
    // STEP 4: SINH NHOM GIA DINH (300 groups)
    // =================================================================
    console.log('🏠 Đang tạo 300 nhóm gia đình/ăn uống...');
    const groups: any[] = [];
    const vnGroupNames = ['Gia đình', 'Nhà của', 'Biệt đội ăn uống', 'Căn hộ', 'Bếp ấm', 'Tổ ấm của'];
    const enGroupNames = ['Family', 'Home of', 'Foodie Squad', 'Roommates', 'Green Kitchen'];

    for (let g = 1; g <= 300; g++) {
      // Leaders are users 16 to 315 (deterministic)
      const leaderId = 15 + g;
      const leaderName = users.find(u => u.MaNguoiDung === leaderId)?.HoTen || 'Leader';
      
      const isVn = Math.random() < 0.75;
      let tenNhom = '';
      if (isVn) {
        tenNhom = `${randChoice(vnGroupNames)} ${leaderName.split(' ').slice(-2).join(' ')}`;
      } else {
        tenNhom = `${leaderName.split(' ').pop()} ${randChoice(enGroupNames)}`;
      }

      groups.push({
        MaNhom: g,
        TenNhom: tenNhom,
        TruongNhom: leaderId,
        MaxThanhVien: g === 1 ? 15 : 10, // Group 1 very large, others default 10
        MoTa: `Nơi quản lý thực phẩm và thực đơn gia đình cho nhóm ${tenNhom}`,
        IsDeleted: g > 295 ? true : false, // Soft-deleted groups
        NgayTao: new Date(Date.now() - randInt(10, 100) * 24 * 3600 * 1000)
      });
    }

    await executeBatch(
      pool,
      'NhomGiaDinh',
      ['MaNhom', 'TenNhom', 'TruongNhom', 'MaxThanhVien', 'MoTa', 'IsDeleted', 'NgayTao'],
      groups,
      true
    );

    // =================================================================
    // STEP 5: PHÂN CHIA THÀNH VIÊN CHO CÁC NHÓM (ThanhVienNhom)
    // =================================================================
    console.log('👥 Ánh xạ thành viên vào các nhóm...');
    const membersList: any[] = [];
    const userGroupMap = new Map<number, number>(); // Keep track of who is in what group

    // 1. Leader must be leader in group
    for (let g = 1; g <= 300; g++) {
      const leaderId = 15 + g;
      membersList.push({
        MaNhom: g,
        MaNguoiDung: leaderId,
        VaiTro: 'LEADER',
        NgayThamGia: groups[g - 1].NgayTao
      });
      userGroupMap.set(leaderId, g);
    }

    // 2. Distribute users 316 to 1030 to groups 1 to 250 (family environments)
    // Group 1 gets 14 members for stress test
    for (let u = 316; u <= 330; u++) {
      membersList.push({
        MaNhom: 1,
        MaNguoiDung: u,
        VaiTro: 'MEMBER',
        NgayThamGia: new Date(groups[0].NgayTao.getTime() + 3600 * 1000)
      });
      userGroupMap.set(u, 1);
    }

    // Distribute the rest (331 to 1030) to groups 2 to 250
    let curGroup = 2;
    for (let u = 331; u <= 1030; u++) {
      membersList.push({
        MaNhom: curGroup,
        MaNguoiDung: u,
        VaiTro: Math.random() > 0.15 ? 'MEMBER' : 'VIEWER',
        NgayThamGia: new Date(groups[curGroup - 1].NgayTao.getTime() + randInt(1, 48) * 3600 * 1000)
      });
      userGroupMap.set(u, curGroup);
      
      curGroup++;
      if (curGroup > 250) {
        curGroup = 2;
      }
    }

    // Groups 251 to 300 are solo (no extra members)
    // Users 1031 to 1050 are unassigned or edge cases

    await executeBatch(
      pool,
      'ThanhVienNhom',
      ['MaNhom', 'MaNguoiDung', 'VaiTro', 'NgayThamGia'],
      membersList
    );

    // =================================================================
    // STEP 6: SINH KHO THỰC PHẨM (12,000 records)
    // =================================================================
    console.log('🍎 Đang tạo 12,000 thực phẩm chi tiết...');
    const foodList: any[] = [];
    let curFoodId = 1;

    // We populate foods for groups 1 to 295 (excluding deleted groups 296-300)
    for (let g = 1; g <= 295; g++) {
      const itemsCount = g === 1 ? 120 : randInt(25, 55); // Group 1 heavy load
      const groupCreated = groups[g - 1].NgayTao;

      for (let i = 0; i < itemsCount; i++) {
        const cat = randChoice(categoriesKeys);
        const catInfo = foodCategories[cat];
        const foodName = randChoice(catInfo.items);
        const unit = randChoice(catInfo.unit);
        const location = randChoice(catInfo.locations);
        
        // Random quantities: some empty (0), some decimals, some integers
        let qty = 0;
        const qtyRand = Math.random();
        if (qtyRand > 0.05) {
          qty = unit === 'kg' || unit === 'l' 
            ? parseFloat(randRange(0.2, 5.0).toFixed(2)) 
            : randInt(1, 15);
        }

        // Expiration distribution: 60% fresh, 20% near, 20% expired
        const expRand = Math.random();
        let hsd: Date | null = null;
        let trangThai = 'CON_HAN';
        
        if (expRand < 0.6) {
          // Fresh (expires in 3 to 90 days)
          hsd = new Date(Date.now() + randInt(3, 90) * 24 * 3600 * 1000);
        } else if (expRand < 0.8) {
          // Near expiry (0 to 2 days)
          hsd = new Date(Date.now() + randInt(0, 2) * 24 * 3600 * 1000);
        } else {
          // Expired (-1 to -60 days)
          hsd = new Date(Date.now() - randInt(1, 60) * 24 * 3600 * 1000);
          trangThai = 'HET_HAN';
        }

        // Gia vị / đồ ăn vặt / đóng hộp có thể không có HSD (15% overall)
        if ((cat === 'Gia vị' || cat === 'Đồ uống' || cat === 'Thực phẩm đóng hộp') && Math.random() < 0.4) {
          hsd = null;
          trangThai = 'CON_HAN';
        }

        const ngayNhap = new Date(groupCreated.getTime() + randInt(0, 10) * 24 * 3600 * 1000);

        foodList.push({
          MaTP: curFoodId,
          MaNhom: g,
          TenTP: foodName,
          SoLuong: qty,
          DonVi: unit,
          HanSuDung: hsd,
          ViTri: location,
          NgayNhap: ngayNhap,
          TrangThai: trangThai,
          Version: 1,
          NgayCapNhat: ngayNhap
        });

        curFoodId++;
      }
    }

    await executeBatch(
      pool,
      'KhoThucPham',
      ['MaTP', 'MaNhom', 'TenTP', 'SoLuong', 'DonVi', 'HanSuDung', 'ViTri', 'NgayNhap', 'TrangThai', 'Version', 'NgayCapNhat'],
      foodList,
      true
    );

    // Store in-memory map of food items grouped by group ID to speed up log generation
    const foodsByGroup = new Map<number, any[]>();
    for (const food of foodList) {
      if (!foodsByGroup.has(food.MaNhom)) {
        foodsByGroup.set(food.MaNhom, []);
      }
      foodsByGroup.get(food.MaNhom)!.push(food);
    }

    // =================================================================
    // STEP 7: SINH DANH SACH MUA SAM & CHI TIET MUA SAM (2,000 / 8,000 records)
    // =================================================================
    console.log('🛒 Đang lập 2,000 danh sách đi chợ và 8,000 mặt hàng...');
    const shoppingLists: any[] = [];
    const shoppingDetails: any[] = [];
    let curListId = 1;
    let curDetailId = 1;

    for (let g = 1; g <= 295; g++) {
      // Find members of this group
      const grpMembers = membersList.filter(m => m.MaNhom === g).map(m => m.MaNguoiDung);
      if (grpMembers.length === 0) continue;

      const listsCount = g === 1 ? 25 : randInt(4, 9);
      for (let l = 0; l < listsCount; l++) {
        const isCompleted = Math.random() < 0.75;
        const ngayTao = new Date(Date.now() - randInt(2, 90) * 24 * 3600 * 1000);
        
        shoppingLists.push({
          MaDanhSach: curListId,
          MaNhom: g,
          NgayTao: ngayTao,
          TrangThai: isCompleted ? 'COMPLETED' : 'DANG_TAO',
          GhiChu: randChoice(['Mua đồ ăn tuần mới', 'Chuẩn bị party cuối tuần', 'Đi siêu thị Coopmart', 'Bổ sung rau củ tươi', 'Mua gia vị hết', 'Mua sắm định kỳ'])
        });

        // Add 3-5 items per list
        const itemsCount = randInt(3, 5);
        for (let i = 0; i < itemsCount; i++) {
          const cat = randChoice(categoriesKeys);
          const catInfo = foodCategories[cat];
          const foodName = randChoice(catInfo.items);
          const unit = randChoice(catInfo.unit);
          
          const qty = unit === 'kg' || unit === 'l' ? parseFloat(randRange(0.5, 3.0).toFixed(2)) : randInt(1, 10);
          const giaDuKien = parseFloat((qty * randInt(15000, 80000)).toFixed(0));
          const giaThucTe = isCompleted ? parseFloat((giaDuKien * randRange(0.9, 1.15)).toFixed(0)) : 0;
          const daMua = isCompleted ? true : Math.random() < 0.25;

          shoppingDetails.push({
            MaCT: curDetailId,
            MaDanhSach: curListId,
            TenThucPham: foodName,
            SoLuong: qty,
            DonVi: unit,
            NguoiPhuTrach: randChoice(grpMembers),
            GiaDuKien: giaDuKien,
            GiaThucTe: giaThucTe,
            DaMua: daMua,
            GhiChu: Math.random() < 0.2 ? 'Mua loại tươi ngon nhất' : null,
            DanhMucHang: cat,
            NgayMua: daMua ? new Date(ngayTao.getTime() + randInt(0, 1) * 3600 * 1000 * 24) : null,
            MaNguoiMua: daMua ? randChoice(grpMembers) : null
          });

          curDetailId++;
        }

        curListId++;
      }
    }

    await executeBatch(
      pool,
      'DanhSachMuaSam',
      ['MaDanhSach', 'MaNhom', 'NgayTao', 'TrangThai', 'GhiChu'],
      shoppingLists,
      true
    );

    await executeBatch(
      pool,
      'ChiTietMuaSam',
      ['MaCT', 'MaDanhSach', 'TenThucPham', 'SoLuong', 'DonVi', 'NguoiPhuTrach', 'GiaDuKien', 'GiaThucTe', 'DaMua', 'GhiChu', 'DanhMucHang', 'NgayMua', 'MaNguoiMua'],
      shoppingDetails,
      true
    );

    // =================================================================
    // STEP 8: NHẬT KÝ BIẾN ĐỘNG KHO (NhatKyKho - 15,000 records)
    // =================================================================
    console.log('📜 Đang tạo 15,000 nhật ký kho thực tế...');
    const logList: any[] = [];
    let curLogId = 1;

    for (let g = 1; g <= 295; g++) {
      const grpFoods = foodsByGroup.get(g) || [];
      if (grpFoods.length === 0) continue;

      const grpMembers = membersList.filter(m => m.MaNhom === g).map(m => m.MaNguoiDung);
      if (grpMembers.length === 0) continue;

      const logsCount = g === 1 ? 250 : randInt(35, 65);
      for (let l = 0; l < logsCount; l++) {
        const food = randChoice(grpFoods);
        const action = randChoice(['THEM_MOI', 'CAP_NHAT', 'TIEU_THU', 'XOA']);
        
        let qtyBefore = 0;
        let qtyAfter = 0;
        let note = '';
        
        if (action === 'THEM_MOI') {
          qtyBefore = 0;
          qtyAfter = food.SoLuong || randInt(1, 5);
          note = `Nhập kho từ danh sách đi chợ. Vị trí: ${food.ViTri}`;
        } else if (action === 'TIEU_THU') {
          qtyBefore = food.SoLuong + randInt(1, 3);
          qtyAfter = food.SoLuong;
          note = randChoice(['Chế biến bữa ăn gia đình', 'Làm món xào buổi tối', 'Làm sinh tố trái cây', 'Nấu canh chua']);
        } else if (action === 'CAP_NHAT') {
          qtyBefore = food.SoLuong;
          qtyAfter = food.SoLuong;
          note = 'Cập nhật lại hạn sử dụng và vị trí lưu trữ';
        } else {
          // XOA
          qtyBefore = randInt(1, 3);
          qtyAfter = 0;
          note = randChoice(['Thực phẩm bị hỏng/nấm mốc', 'Hết hạn sử dụng lâu ngày', 'Mùi lạ không dùng được']);
        }

        logList.push({
          MaNhatKy: curLogId,
          MaTP: food.MaTP,
          TenTP: food.TenTP,
          MaNhom: g,
          NguoiThucHien: randChoice(grpMembers),
          HanhDong: action,
          SoLuongTruoc: qtyBefore,
          SoLuongSau: qtyAfter,
          DonVi: food.DonVi,
          NgayThucHien: new Date(Date.now() - randInt(0, 90) * 24 * 3600 * 1000 - randInt(0, 23) * 3600 * 1000),
          GhiChu: note
        });

        curLogId++;
      }
    }

    await executeBatch(
      pool,
      'NhatKyKho',
      ['MaNhatKy', 'MaTP', 'TenTP', 'MaNhom', 'NguoiThucHien', 'HanhDong', 'SoLuongTruoc', 'SoLuongSau', 'DonVi', 'NgayThucHien', 'GhiChu'],
      logList,
      true
    );

    // =================================================================
    // STEP 9: CÔNG THỨC MÓN ĂN & NGUYÊN LIỆU MÓN (50 / 250 records)
    // =================================================================
    console.log('🍳 Đang soạn thảo 50 công thức món ăn...');
    const recipes: any[] = [];
    const recipeIngredients: any[] = [];
    
    const recipeNames = [
      { name: 'Phở bò Hà Nội', desc: 'Món ăn truyền thống Việt Nam với bánh phở, thịt bò mềm và nước dùng đậm đà.', cat: 'Món chính', diff: 'Khó', prep: 120 },
      { name: 'Cơm tấm Sườn Bì Chả', desc: 'Đặc sản Sài Gòn với gạo tấm thơm dẻo, sườn nướng mật ong và bì chả hấp trứng.', cat: 'Món chính', diff: 'Trung bình', prep: 60 },
      { name: 'Sườn xào chua ngọt', desc: 'Món sườn heo xào đậm đà sốt me chua ngọt dịu ăn rất đưa cơm.', cat: 'Món chính', diff: 'Dễ', prep: 35 },
      { name: 'Canh chua cá lóc', desc: 'Món canh chua giải nhiệt miền Tây Nam Bộ đậm vị thơm, cà chua, dọc mùng.', cat: 'Món chính', diff: 'Trung bình', prep: 40 },
      { name: 'Thịt kho hột vịt', desc: 'Món ăn không thể thiếu ngày Tết với thịt ba chỉ kho mềm rục cùng trứng vịt.', cat: 'Món chính', diff: 'Trung bình', prep: 90 },
      { name: 'Rau muống xào tỏi', desc: 'Món rau xào dân dã giòn ngọt, thơm nồng hương tỏi phi thơm.', cat: 'Khai vị', diff: 'Dễ', prep: 15 },
      { name: 'Đậu hũ sốt cà chua', desc: 'Đậu hũ chiên vàng giòn rồi sốt cà chua sền sệt thơm lừng hành lá.', cat: 'Món chính', diff: 'Dễ', prep: 20 },
      { name: 'Gỏi cuốn tôm thịt', desc: 'Cuốn tôm luộc, thịt ba chỉ, bún tươi và rau sống chấm tương đen bơ lạc.', cat: 'Khai vị', diff: 'Dễ', prep: 25 },
      { name: 'Spaghetti Carbonara', desc: 'Món mì Ý sốt kem trứng béo ngậy trộn ba chỉ xông khói giòn rụm.', cat: 'Món chính', diff: 'Dễ', prep: 30 },
      { name: 'Beefsteak sốt tiêu đen', desc: 'Thịt bò áp chảo bơ tỏi mềm ngọt ăn kèm khoai tây chiên và sốt tiêu đen.', cat: 'Món chính', diff: 'Trung bình', prep: 25 },
      { name: 'Chicken Breast Salad', desc: 'Salad ức gà áp chảo xé sợi trộn rau xanh và sốt dầu giấm dành cho gymer.', cat: 'Ăn nhẹ', diff: 'Dễ', prep: 20 },
      { name: 'Cheesecake dâu tây', desc: 'Món tráng miệng ngọt ngào không cần nướng với phô mai béo ngậy và mứt dâu tây.', cat: 'Tráng miệng', diff: 'Trung bình', prep: 45 }
    ];

    let curMonId = 1;
    
    // Add 20 system recipes (MaNhom = null)
    for (let r = 1; r <= 20; r++) {
      const info = recipeNames[(r - 1) % recipeNames.length];
      recipes.push({
        MaMon: curMonId,
        TenMon: info.name,
        CongThuc: `Nguyên liệu chính: ${info.name.split(' ')[0]} và gia vị các loại.`,
        HuongDan: 'Bước 1: Sơ chế nguyên liệu sạch sẽ.\nBước 2: Tẩm ướp gia vị.\nBước 3: Chế biến nhiệt và thưởng thức nóng.',
        NgayTao: new Date(Date.now() - 150 * 24 * 3600 * 1000),
        MaNhom: null,
        MaNguoiTao: null,
        ThoiGian: info.prep,
        KhauPhan: randChoice([2, 4, 6]),
        DoKho: info.diff,
        DanhMuc: info.cat,
        MoTa: info.desc,
        HinhAnh: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`
      });
      
      // Seed recipe ingredients mapping to Group 1 foods (deterministic)
      const group1Foods = foodsByGroup.get(1) || [];
      if (group1Foods.length >= 3) {
        recipeIngredients.push({ MaMon: curMonId, MaTP: group1Foods[0].MaTP, SoLuongCan: 0.5 });
        recipeIngredients.push({ MaMon: curMonId, MaTP: group1Foods[1].MaTP, SoLuongCan: 1.0 });
        recipeIngredients.push({ MaMon: curMonId, MaTP: group1Foods[2].MaTP, SoLuongCan: 2.0 });
      }

      curMonId++;
    }

    // Add 30 group-specific recipes (assigned to groups 1 to 30)
    for (let r = 1; r <= 30; r++) {
      const info = recipeNames[r % recipeNames.length];
      const gId = r; // Map to Group 1 to 30
      const grpLeader = groups[gId - 1].TruongNhom;
      
      recipes.push({
        MaMon: curMonId,
        TenMon: `${info.name} (Gia đình tự làm)`,
        CongThuc: `Công thức gia truyền cho món ${info.name}.`,
        HuongDan: 'Nấu theo hướng dẫn đặc biệt của gia đình.',
        NgayTao: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        MaNhom: gId,
        MaNguoiTao: grpLeader,
        ThoiGian: info.prep + 10,
        KhauPhan: 4,
        DoKho: info.diff,
        DanhMuc: info.cat,
        MoTa: `Công thức riêng tư của gia đình cho món ${info.name}`,
        HinhAnh: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`
      });

      // Map ingredients to this group's foods
      const grpFoods = foodsByGroup.get(gId) || [];
      if (grpFoods.length >= 3) {
        recipeIngredients.push({ MaMon: curMonId, MaTP: grpFoods[0].MaTP, SoLuongCan: 0.5 });
        recipeIngredients.push({ MaMon: curMonId, MaTP: grpFoods[1].MaTP, SoLuongCan: 1.0 });
        recipeIngredients.push({ MaMon: curMonId, MaTP: grpFoods[2].MaTP, SoLuongCan: 3.0 });
      }

      curMonId++;
    }

    await executeBatch(
      pool,
      'MonAn',
      ['MaMon', 'TenMon', 'CongThuc', 'HuongDan', 'NgayTao', 'MaNhom', 'MaNguoiTao', 'ThoiGian', 'KhauPhan', 'DoKho', 'DanhMuc', 'MoTa', 'HinhAnh'],
      recipes,
      true
    );

    await executeBatch(
      pool,
      'NguyenLieuMon',
      ['MaMon', 'MaTP', 'SoLuongCan'],
      recipeIngredients
    );

    // =================================================================
    // STEP 10: KẾ HOẠCH BỮA ĂN (KeHoachBuaAn - 2,500 records)
    // =================================================================
    console.log('📅 Lên lịch ăn uống cho 2,500 bữa ăn...');
    const mealPlans: any[] = [];
    let curMealId = 1;

    for (let g = 1; g <= 295; g++) {
      // Plan meals for the last 30 days and next 7 days (total 37 days)
      const mealsCount = g === 1 ? 50 : randInt(6, 12);
      
      for (let m = 0; m < mealsCount; m++) {
        const date = new Date(Date.now() - randInt(-7, 30) * 24 * 3600 * 1000);
        const buoi = randChoice(['SANG', 'TRUA', 'TOI']);
        const recipe = randChoice(recipes);
        
        mealPlans.push({
          MaKeHoach: curMealId,
          MaNhom: g,
          Ngay: date,
          Buoi: buoi,
          MaMon: recipe.MaMon,
          GhiChu: randChoice(['Ăn cơm nóng', 'Cơm tươm tất', 'Chuẩn bị nhanh gọn', 'Đãi tiệc nhỏ']),
          SoKhauPhan: randChoice([2, 4, 6]),
          TenMonAn: recipe.TenMon
        });

        curMealId++;
      }
    }

    await executeBatch(
      pool,
      'KeHoachBuaAn',
      ['MaKeHoach', 'MaNhom', 'Ngay', 'Buoi', 'MaMon', 'GhiChu', 'SoKhauPhan', 'TenMonAn'],
      mealPlans,
      true
    );

    // =================================================================
    // STEP 11: BÁO CÁO CHI TIÊU HÀNG THÁNG (BaoCaoChiTieu - 1,200 records)
    // =================================================================
    console.log('📊 Thiết lập 1,200 báo cáo tài chính tài khóa 4 tháng qua...');
    const reportsList: any[] = [];
    let curReportId = 1;

    for (let g = 1; g <= 300; g++) {
      const membersCount = membersList.filter(m => m.MaNhom === g).length || 1;
      
      // 4 months: March, April, May, June 2026
      const months = [
        { label: 'Tháng 03 - 2026', offset: 3 },
        { label: 'Tháng 04 - 2026', offset: 2 },
        { label: 'Tháng 05 - 2026', offset: 1 },
        { label: 'Tháng 06 - 2026', offset: 0 }
      ];

      for (const m of months) {
        const chiPhi = parseFloat(randRange(1200000, 6800000).toFixed(0));
        const langPhi = parseFloat((chiPhi * randRange(0.04, 0.18)).toFixed(0)); // 4% to 18% food waste ratio
        
        reportsList.push({
          MaBaoCao: curReportId,
          MaNhom: g,
          TuanThang: m.label,
          TongChiPhi: chiPhi,
          TongLangPhi: langPhi,
          NgayTao: new Date(Date.now() - m.offset * 30 * 24 * 3600 * 1000),
          SoThanhVien: membersCount,
          TongCalo: randInt(250000, 750000)
        });

        curReportId++;
      }
    }

    await executeBatch(
      pool,
      'BaoCaoChiTieu',
      ['MaBaoCao', 'MaNhom', 'TuanThang', 'TongChiPhi', 'TongLangPhi', 'NgayTao', 'SoThanhVien', 'TongCalo'],
      reportsList,
      true
    );

    // =================================================================
    // STEP 12: MÃ MỜI GIA ĐÌNH & THÔNG BÁO HỘ (FamilyInvites / FamilyNotifications)
    // =================================================================
    console.log('✉️ Tạo 500 mã mời và 2,000 thông báo biến động...');
    
    // 500 FamilyInvites
    const invites: any[] = [];
    for (let i = 1; i <= 500; i++) {
      const gId = randInt(1, 300);
      const grpLeader = groups[gId - 1].TruongNhom;
      const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char unique code
      
      invites.push({
        MaNhom: gId,
        Code: code,
        TaoBoiId: grpLeader,
        MaxUses: randInt(2, 5),
        UsedCount: randInt(0, 2),
        ExpiresAt: new Date(Date.now() + randInt(-3, 10) * 24 * 3600 * 1000), // Some active, some expired
        IsDeleted: Math.random() < 0.1 ? true : false,
        NgayTao: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        NgayCapNhat: new Date(Date.now() - 5 * 24 * 3600 * 1000)
      });
    }

    await executeBatch(
      pool,
      'FamilyInvites',
      ['MaNhom', 'Code', 'TaoBoiId', 'MaxUses', 'UsedCount', 'ExpiresAt', 'IsDeleted', 'NgayTao', 'NgayCapNhat'],
      invites
    );

    // 2,000 FamilyNotifications
    const familyNotifications: any[] = [];
    const notificationTemplates = [
      { text: 'đã gia nhập nhóm gia đình thông qua mã mời.', type: 'JOIN' },
      { text: 'đã rời nhóm gia đình.', type: 'LEAVE' },
      { text: 'đã chuyển nhượng quyền Trưởng nhóm.', type: 'TRANSFER' },
      { text: 'đã cập nhật thông tin tên nhóm gia đình.', type: 'INFO_UPDATE' }
    ];

    for (let i = 0; i < 2000; i++) {
      const gId = randInt(1, 300);
      const grpMembers = membersList.filter(m => m.MaNhom === gId).map(m => m.MaNguoiDung);
      const userObj = users.find(u => u.MaNguoiDung === randChoice(grpMembers)) || users[15];
      const template = randChoice(notificationTemplates);
      
      familyNotifications.push({
        MaNhom: gId,
        NoiDung: `${userObj.HoTen} ${template.text}`,
        Loai: template.type,
        NgayTao: new Date(Date.now() - randInt(1, 90) * 24 * 3600 * 1000)
      });
    }

    await executeBatch(
      pool,
      'FamilyNotifications',
      ['MaNhom', 'NoiDung', 'Loai', 'NgayTao'],
      familyNotifications
    );

    // =================================================================
    // STEP 13: NHẬT KÝ QUẢN TRỊ ADMIN (AuditLogs - 1,000 records)
    // =================================================================
    console.log('🛡️ Ghi nhận 1,000 nhật ký vận hành quản trị AuditLogs...');
    const auditLogs: any[] = [];
    const adminActions = [
      { action: 'Đăng nhập Admin Panel', type: 'auth', status: 'success', desc: 'Quản trị viên đăng nhập hệ thống thành công.' },
      { action: 'Khóa tài khoản người dùng', type: 'user', status: 'success', desc: 'Đã khóa tài khoản do vi phạm quy tắc hệ thống.' },
      { action: 'Mở khóa tài khoản người dùng', type: 'user', status: 'success', desc: 'Đã khôi phục tài khoản hoạt động bình thường.' },
      { action: 'Dọn dẹp tài khoản ảo', type: 'user', status: 'success', desc: 'Đã quét dọn và loại bỏ các tài khoản ảo không hoạt động.' },
      { action: 'Tạo công thức nấu ăn hệ thống', type: 'recipe', status: 'success', desc: 'Đã xuất bản công thức món ăn công cộng mới.' },
      { action: 'Cập nhật cài đặt hệ thống', type: 'settings', status: 'success', desc: 'Thay đổi chính sách bảo mật hệ thống.' },
      { action: 'Xuất báo cáo tổng hợp', type: 'report', status: 'success', desc: 'Tải xuống báo cáo vận hành toàn quốc.' }
    ];

    for (let i = 1; i <= 1000; i++) {
      // Admin users are 1 to 15
      const adminId = randInt(1, 15);
      const adminUser = users.find(u => u.MaNguoiDung === adminId)!;
      const act = randChoice(adminActions);
      
      auditLogs.push({
        MaAdmin: adminId,
        HoTenAdmin: adminUser.HoTen,
        HanhDong: act.action,
        Loai: act.type,
        TrangThai: act.status,
        MoTa: act.desc,
        DiaChiIP: `192.168.1.${randInt(10, 199)}`,
        NgayTao: new Date(Date.now() - randInt(1, 120) * 24 * 3600 * 1000)
      });
    }

    await executeBatch(
      pool,
      'AuditLogs',
      ['MaAdmin', 'HoTenAdmin', 'HanhDong', 'Loai', 'TrangThai', 'MoTa', 'DiaChiIP', 'NgayTao'],
      auditLogs
    );

    // =================================================================
    // STEP 14: KIỂM TRA TOÀN VẸN VÀ THỐNG KÊ (QA VERIFICATION)
    // =================================================================
    console.log('\n=================================================================');
    console.log('🔍 [QA Verification] BẮT ĐẦU KIỂM TRA TOÀN VẸN DỮ LIỆU SEED...');
    console.log('=================================================================');
    
    const tablesCount = [
      'NguoiDung', 'NhomGiaDinh', 'ThanhVienNhom', 'KhoThucPham',
      'DanhSachMuaSam', 'ChiTietMuaSam', 'NhatKyKho', 'MonAn',
      'NguyenLieuMon', 'KeHoachBuaAn', 'BaoCaoChiTieu', 'FamilyInvites',
      'FamilyNotifications', 'AuditLogs'
    ];

    for (const table of tablesCount) {
      const res = await pool.request().query(`SELECT COUNT(*) AS count FROM ${table}`);
      console.log(`📊 Bảng: ${table.padEnd(22)} | Số bản ghi: ${res.recordset[0].count}`);
    }

    console.log('\n🎉 THÀNH CÔNG: QUÁ TRÌNH SEED DỮ LIỆU HOÀN TẤT TRỌN VẸN VÀ TỐI ƯU!');
    console.log('Bạn có thể khởi chạy ứng dụng để bắt đầu demo và kiểm thử.');
    console.log('=================================================================\n');

  } catch (error) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH SEED DỮ LIỆU:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Đã ngắt kết nối an toàn tới SQL Server.');
    }
  }
}

runSeeder();
