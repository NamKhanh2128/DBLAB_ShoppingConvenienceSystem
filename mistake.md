# Danh Sách Thiếu Sót, Lỗi Logic Tiềm Ẩn Và Rủi Ro Hệ Thống (Shopping Convenience System)

Tài liệu này được biên soạn dưới góc nhìn phối hợp của **Chuyên gia Kiểm thử Phần mềm (QA/QC Engineer)**, **Chuyên gia Trải nghiệm Người dùng (UX/UI Specialist)**, và **Chuyên gia Phân tích Hệ thống (System Analyst)**. Dưới đây là bảng phân tích chi tiết các lỗ hổng nghiệp vụ, điểm nghẽn trải nghiệm (pain points), trường hợp ngoại lệ (edge cases) và rủi ro bảo mật được suy luận dựa trên logic vận hành thực tế của một ứng dụng quản lý gia đình và mua sắm.

---

## 1. Module: Auth (Xác thực & Phân quyền)

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Xung đột trạng thái gia đình khi mời thành viên:** Một người dùng đã thuộc về Gia đình A nhưng vẫn nhận và nhấn vào liên kết tham gia Gia đình B. Hệ thống có thể tự động ép người dùng rời Gia đình A mà không có sự đồng ý rõ ràng, hoặc gây lỗi crash luồng đăng ký/tham gia do ràng buộc cơ sở dữ liệu (một user chỉ thuộc một family).
*   **Liên kết mời (Invitation Link) vô hạn:** Đường dẫn mời tham gia gia đình không có thời gian hết hạn hoặc giới hạn số lần sử dụng. Bất kỳ ai có được liên kết này đều có thể tự ý gia nhập gia đình vào bất kỳ thời điểm nào.
*   **Phiên đăng nhập song song không đồng bộ:** Khi người dùng thực hiện đổi mật khẩu trên Thiết bị A, phiên đăng nhập (Session/Token) trên Thiết bị B của người dùng đó vẫn hoạt động bình thường mà không bị bắt buộc đăng xuất hoặc yêu cầu xác thực lại.
*   **Lỗi phân quyền chéo (Role-based access control bypass):** Thành viên có vai trò "Thành viên thường" hoặc "Trẻ em" vẫn có thể thực hiện các thao tác quản trị như đổi tên gia đình, mời thành viên mới, hoặc xóa các thành viên khác nếu hệ thống chỉ kiểm tra quyền ở phía giao diện (Frontend) mà không kiểm tra chặt chẽ ở máy chủ (Backend).

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Trải nghiệm đăng nhập lặp đi lặp lại:** Thiếu tùy chọn "Duy trì đăng nhập" (Remember me). Người nội trợ bận rộn, tay chân thường dính nước hoặc bụi bẩn khi làm bếp, phải liên tục nhập lại email và mật khẩu mỗi khi ứng dụng tự động hết hạn phiên sau vài tiếng.
*   **Quy trình tham gia gia đình phức tạp:** Bắt buộc người được mời phải tải ứng dụng và đăng ký tài khoản trước rồi mới được nhấn link mời, thay vì cho phép họ đăng ký trực tiếp và tự động liên kết gia đình ngay sau khi hoàn tất quy trình từ liên kết mời.
*   **Thông báo lỗi mơ hồ:** Hiển thị thông báo chung chung như "Có lỗi xảy ra" khi đăng nhập thất bại, không hướng dẫn người dùng biết họ nhập sai email, sai mật khẩu, hay tài khoản chưa được kích hoạt.

### Edge Cases (Trường hợp ngoại lệ)
*   **Đăng ký tài khoản đồng thời:** Hai người dùng khác nhau cố gắng đăng ký tài khoản cùng một lúc bằng cùng một địa chỉ email (Race condition trên cơ sở dữ liệu nếu trường email không được cấu hình unique index vật lý hoặc thiếu cơ chế khóa).
*   **Độ dài và ký tự đặc biệt trong thông tin cá nhân:** Tên thành viên nhập vào chứa các ký tự đặc biệt, emoji phức tạp, hoặc độ dài cực ngắn (1 ký tự) / cực dài (trên 100 ký tự) gây vỡ bố cục hiển thị thẻ thành viên hoặc lỗi lưu trữ cơ sở dữ liệu.
*   **Sử dụng liên kết mời đã bị Admin thu hồi:** Admin gia đình đã tạo liên kết mời mới (làm vô hiệu hóa liên kết cũ) nhưng người dùng vẫn cố tình nhấn vào liên kết cũ để tham gia.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **Rò rỉ token qua LocalStorage:** Lưu trữ mã xác thực (Access Token/Refresh Token) dưới dạng văn bản thuần túy (Plain text) trong LocalStorage của trình duyệt, tạo cơ hội cho các cuộc tấn công XSS đánh cắp thông tin đăng nhập.
*   **Tấn công dò mật khẩu và spam email:** Thiếu cơ chế giới hạn tần suất yêu cầu (Rate Limiting) tại các API Đăng nhập, Đăng ký và Quên mật khẩu, dẫn đến nguy cơ bị tấn công Brute-force mật khẩu hoặc spam gửi email OTP liên tục làm nghẽn tài nguyên hệ thống.
*   **Thiếu cơ chế xác thực đa yếu tố (MFA) cho tài khoản Admin gia đình:** Tài khoản chủ hộ (Admin) chứa thông tin tài chính chi tiêu nhạy cảm của gia đình nhưng chỉ được bảo vệ bằng mật khẩu đơn giản, dễ bị xâm nhập.

---

## 2. Module: Family (Quản lý thành viên)

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Gia đình "vô chủ" (Orphan Family):** Chủ hộ (Admin duy nhất) thực hiện hành động xóa tài khoản của chính mình hoặc tự ý rời khỏi gia đình mà không chỉ định một Admin mới. Hệ thống rơi vào trạng thái không ai có quyền quản lý thành viên hoặc giải tán nhóm.
*   **Rò rỉ thông tin lịch sử cho thành viên mới:** Một thành viên mới (ví dụ: người giúp việc mới thuê hoặc thành viên mới kết nạp) ngay khi vừa vào gia đình đã có thể xem toàn bộ lịch sử chi tiêu, thói quen ăn uống, thực đơn và lịch trình đi chợ riêng tư của gia đình từ nhiều năm trước.
*   **Lỗi mất liên kết dữ liệu khi xóa thành viên (Cascade Delete Error):** Khi Admin xóa một thành viên ra khỏi gia đình, hệ thống xóa luôn toàn bộ các công thức nấu ăn, danh sách mua sắm do thành viên đó từng tạo, dẫn đến việc mất mát dữ liệu nghiêm trọng đối với các thành viên còn lại.

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Không có dấu hiệu nhận diện trực quan giữa các thành viên:** Giao diện không hỗ trợ tải lên ảnh đại diện (avatar) hoặc tự động gán màu sắc đặc trưng cho từng thành viên. Khi nhìn vào danh sách công việc mua sắm hoặc thực đơn, người dùng rất khó nhận biết nhanh ai là người phụ trách việc gì.
*   **Thiếu hệ thống thông báo realtime trong gia đình:** Khi một thành viên được thêm vào, bị xóa đi, hoặc tự rời nhóm, các thành viên khác trong gia đình không hề nhận được bất kỳ thông báo đẩy (Push Notification) hoặc thư thông báo nào trong ứng dụng.
*   **Khó khăn trong việc chuyển đổi quyền sở hữu:** Không có quy trình trực quan để Admin chuyển giao vai trò quản trị cho một thành viên khác trong gia đình.

### Edge Cases (Trường hợp ngoại lệ)
*   **Cố tình tham gia nhiều gia đình cùng lúc:** Một tài khoản người dùng cố gắng lách luật bằng cách gửi nhiều yêu cầu tham gia vào các gia đình khác nhau cùng một lúc từ nhiều thiết bị để trở thành thành viên của nhiều nhóm (nếu quy định nghiệp vụ giới hạn 1 user chỉ thuộc 1 family).
*   **Admin tự hạ quyền của chính mình:** Người duy nhất có quyền Admin tự chuyển vai trò của mình thành "Thành viên thường" trong khi gia đình chưa có bất kỳ Admin nào khác thay thế.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **Lỗ hổng IDOR trên thông tin gia đình:** Sử dụng ID tự tăng dạng số nguyên tuần tự (ví dụ: `family/1`, `family/2`) trong các yêu cầu API. Thành viên của Gia đình A có thể dễ dàng thay đổi ID trên URL hoặc công cụ kiểm thử API để xem danh sách thành viên và thông tin cá nhân của Gia đình B.
*   **Mâu thuẫn dữ liệu khi cập nhật đồng thời:** Hai Admin của cùng một gia đình mở trang cấu hình và cùng thực hiện cập nhật tên gia đình hoặc địa chỉ nhà cùng một lúc, dẫn đến việc dữ liệu của người bấm sau đè lên dữ liệu của người bấm trước mà không có cảnh báo xung đột (Dirty Write).

---

## 3. Module: Inventory (Quản lý tủ lạnh & Kho)

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Xung đột đơn vị đo lường không chuẩn hóa:** Hệ thống cho phép nhập tự do đơn vị (ví dụ: "bó", "gói", "kg", "gam"). Khi cần tính toán lượng thực phẩm còn lại hoặc tự động gợi ý mua sắm, hệ thống không thể quy đổi (ví dụ: kho còn "500g" thịt heo, công thức nấu ăn yêu cầu "0.5kg", hệ thống vẫn báo thiếu hàng và yêu cầu đi mua).
*   **Thực phẩm hết hạn bị bỏ quên:** Thực phẩm đã quá hạn sử dụng (Expired) vẫn hiển thị bình thường trong danh sách nguyên liệu khả dụng để nấu ăn. Hệ thống không tự động chuyển trạng thái của chúng sang "Hỏng/Cần loại bỏ" hoặc đưa ra cảnh báo khẩn cấp cho người nội trợ.
*   **Hụt kho do không đồng bộ thời gian thực:** Hai thành viên cùng đi chợ hoặc nấu ăn. Thành viên A đã lấy 3 quả trứng cuối cùng trong tủ lạnh ra dùng nhưng chưa cập nhật app. Thành viên B mở app thấy vẫn còn 3 quả trứng nên lên thực đơn món trứng cho buổi tối, dẫn đến tình huống thực tế không còn nguyên liệu.

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Quy trình nhập kho quá thủ công và mất thời gian:** Người nội trợ đi siêu thị về với một túi đồ lớn gồm 20-30 món. Việc phải ngồi mở điện thoại, nhấn nút thêm mới, gõ tên từng món, chọn ngày hết hạn, chọn số lượng cho từng món một là một cực hình thực tế. Thiếu chức năng quét mã vạch (Barcode) hoặc chụp hóa đơn để tự động phân tích nhập kho.
*   **Date Picker gây ức chế:** Khi nhập hạn sử dụng cho các thực phẩm ăn nhanh (hạn dùng trong 2-3 ngày), người dùng vẫn phải mở một hộp thoại lịch (Calendar) lớn, vuốt chọn năm, chọn tháng, chọn ngày rất rườm rà thay vì có các nút bấm nhanh: "Hôm nay", "Ngày mai", "3 ngày tới", "1 tuần tới".
*   **Thiếu bộ lọc và sắp xếp thông minh:** Danh sách kho quá dài nhưng không phân loại rõ ràng theo khu vực lưu trữ (Ngăn đá, Ngăn mát, Tủ khô) hoặc theo mức độ khẩn cấp (Sắp hết hạn, Sắp hết số lượng), khiến người dùng phải cuộn màn hình mỏi mắt để tìm kiếm.

### Edge Cases (Trường hợp ngoại lệ)
*   **Số lượng và giá trị không thực tế:** Người dùng nhập số lượng âm (ví dụ: `-5` hộp sữa) hoặc nhập số lượng cực đại (ví dụ: `999,999,999` quả cà chua) khiến giao diện bị tràn, vỡ layout hiển thị hoặc gây lỗi tràn số ở cơ sở dữ liệu.
*   **Cùng một mặt hàng nhưng khác hạn sử dụng:** Trong tủ lạnh có 1 hộp sữa hết hạn vào ngày mai và 2 hộp sữa cùng loại hết hạn vào tuần sau. Nếu hệ thống gộp chung thành một dòng "3 hộp sữa" thì sẽ làm mất thông tin hạn sử dụng của hộp sắp hỏng. Nếu tách làm hai dòng thì giao diện danh sách kho sẽ cực kỳ rối rắm và trùng lặp.
*   **Thao tác đồng thời trên một mặt hàng:** Hai thành viên cùng nhấn nút "Dùng hết" một hộp sữa tại cùng một thời điểm từ hai điện thoại khác nhau.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **Thay đổi kho của nhà khác qua API:** Các API thêm, sửa, xóa vật phẩm trong kho không thực hiện kiểm tra chéo (Cross-check) xem vật phẩm đó có thực sự thuộc về kho của gia đình mà người dùng hiện tại đang tham gia hay không.
*   **Thiếu nhật ký thay đổi kho (Inventory Audit Log):** Đồ ăn trong tủ lạnh bị biến mất hoặc thay đổi số lượng nhưng không ai biết ai là người đã bấm cập nhật hoặc tiêu thụ, gây ra sự nghi ngờ lẫn nhau trong gia đình.

---

## 4. Module: Meal Plan (Lên thực đơn)

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Thực đơn đi ngược thời gian:** Hệ thống cho phép người dùng lên thực đơn, chuẩn bị món ăn cho các ngày hoặc các buổi đã qua trong quá khứ, dẫn đến dữ liệu báo cáo thống kê bị sai lệch nghiêm trọng.
*   **Lên thực đơn từ kho rỗng:** Hệ thống cho phép tạo và phê duyệt một thực đơn sử dụng các nguyên liệu hoàn toàn không có sẵn trong kho (Inventory) mà không đưa ra bất kỳ cảnh báo nào cho người dùng, hoặc không tự động đề xuất thêm các nguyên liệu thiếu đó vào Danh sách mua sắm (Shopping List).
*   **Lỗi tham chiếu khi công thức bị xóa:** Người dùng đã lên lịch ăn món "Phở Bò" vào tối thứ Sáu dựa trên một công thức có sẵn. Tuy nhiên, thứ Năm, người tạo công thức đó đã xóa công thức này khỏi hệ thống. Đến thứ Sáu, thực đơn của gia đình bị crash không hiển thị được hoặc mất toàn bộ danh sách nguyên liệu cần chuẩn bị.

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Thiếu chế độ xem dạng Lịch trực quan (Calendar View):** Thực đơn hiển thị dưới dạng một danh sách cuộn dọc đơn điệu. Người dùng không có cái nhìn tổng quan về kế hoạch ăn uống của cả tuần hoặc cả tháng, rất khó để cân đối dinh dưỡng giữa các ngày (ví dụ: tránh ăn thịt gà liên tục 3 ngày).
*   **Quy trình lên thực đơn quá nhiều bước:** Để thêm một món ăn vào thực đơn, người dùng phải thực hiện chuỗi thao tác: Chọn ngày -> Chọn bữa (Sáng/Trưa/Tối) -> Tìm kiếm công thức -> Nhập số lượng phần ăn -> Bấm Lưu. Quy trình này quá tốn thời gian cho một kế hoạch tuần ăn uống thông thường.
*   **Không có tính năng sao chép nhanh:** Không cho phép người dùng sao chép thực đơn của "Thứ Hai tuần trước" sang "Thứ Hai tuần này", bắt buộc họ phải làm lại toàn bộ quy trình lên thực đơn từ đầu dù thói quen ăn uống thường lặp lại.

### Edge Cases (Trường hợp ngoại lệ)
*   **Trùng lặp bữa ăn phi lý:** Người dùng cố tình thêm cùng một món ăn nhiều lần vào cùng một buổi của một ngày, hoặc lên lịch ăn 10 món khác nhau cho một bữa sáng của một gia đình chỉ có 2 người.
*   **Không tự động điều chỉnh tỷ lệ khi thay đổi khẩu phần (Servings):** Thực đơn ban đầu lên lịch cho 4 người ăn theo công thức chuẩn. Khi Admin đổi số lượng thành 10 người ăn (nhà có khách), lượng nguyên liệu dự tính của bữa ăn đó trong Meal Plan vẫn giữ nguyên của 4 người, dẫn đến chuẩn bị thiếu thực phẩm.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **Can thiệp thực đơn nhà khác:** Lỗ hổng cho phép người dùng thay đổi ID của Meal Plan trên yêu cầu gửi đi để xem, sửa hoặc xóa thực đơn của một gia đình hoàn toàn xa lạ.
*   **Rác cơ sở dữ liệu do xóa không triệt để:** Khi một Meal Plan bị hủy hoặc xóa, các bản ghi chi tiết bữa ăn (Meal Plan Items) hoặc các liên kết nguyên liệu phụ thuộc không được dọn dẹp sạch sẽ khỏi cơ sở dữ liệu, tích tụ lâu ngày làm chậm hệ thống.

---

## 5. Module: Recipes (Công thức nấu ăn)

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Đơn vị định lượng phi kỹ thuật:** Công thức nấu ăn chứa các định lượng không thể đo đếm bằng số như "nêm nếm vừa ăn", "một ít muối", "vài cọng hành", "nước dùng vừa đủ". Khi người dùng nhấn nút "Tự động thêm nguyên liệu vào danh sách mua sắm", hệ thống sẽ bị lỗi tính toán hoặc bỏ qua các nguyên liệu này.
*   **Mất kiểm soát quyền riêng tư của công thức:** Một gia đình tự sáng tạo ra một công thức gia truyền riêng tư (Private Recipe) và chỉ muốn lưu hành nội bộ. Tuy nhiên, do lỗi logic phân quyền, công thức này lại hiển thị công khai trên thanh tìm kiếm của toàn bộ người dùng hệ thống. Ngược lại, công thức mặc định của hệ thống (System Recipe) lại có thể bị một user thường xóa mất.
*   **Nấu ăn ảo (Cooked without deduction):** Khi người dùng nhấn nút "Đã nấu món này" từ công thức nấu ăn, hệ thống không tự động thực hiện lệnh trừ đi các nguyên liệu tương ứng trong Inventory (kho tủ lạnh), khiến số lượng thực tế và số lượng trên app bị lệch nhau.

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Hướng dẫn nấu ăn là một khối văn bản khổng lồ:** Toàn bộ các bước thực hiện được viết chung trong một vùng văn bản dài dòng. Người dùng vừa nấu ăn, tay dính dầu mỡ vừa phải vuốt màn hình để tìm xem mình đang ở bước nào. Thiếu thiết kế chia nhỏ theo từng bước (Step-by-step) dạng thẻ trượt lớn và bộ đếm ngược thời gian (Timer) tích hợp sẵn cho các bước cần ninh, hầm, nướng.
*   **Không có tính năng gợi ý món ăn theo nguyên liệu sẵn có:** Người dùng mở tủ lạnh thấy còn trứng, cà chua và thịt băm sắp hỏng. Họ muốn tìm xem có công thức nào kết hợp 3 món này không nhưng hệ thống chỉ hỗ trợ tìm kiếm công thức theo tên món ăn, không hỗ trợ tìm theo danh sách nguyên liệu đầu vào.
*   **Ảnh công thức tải chậm và méo mó:** Không có cơ chế nén ảnh hoặc cắt ảnh tự động (Auto-crop). Người dùng tải lên ảnh chụp món ăn chất lượng cao dung lượng lớn làm giao diện tải cực kỳ chậm, vỡ khung hiển thị trên các thiết bị di động màn hình nhỏ.

### Edge Cases (Trường hợp ngoại lệ)
*   **Công thức không có nguyên liệu hoặc không có hướng dẫn:** Người dùng cố tình tạo một công thức trống rỗng (chỉ có tên món ăn) hoặc nhập nguyên liệu với số lượng bằng 0 hoặc số lượng âm.
*   **Tải lên tập tin độc hại giả dạng hình ảnh:** Người dùng tải lên một tệp tin script độc hại (ví dụ: `shell.php` hoặc tập tin thực thi `.exe`) đổi đuôi thành `.png` vào trường tải ảnh công thức. Nếu server không kiểm tra định dạng nội dung tệp thực tế (MIME type validation), hệ thống có thể bị chiếm quyền điều khiển.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **Lỗ hổng Stored XSS trong các bước nấu ăn:** Hệ thống cho phép nhập định dạng Markdown hoặc HTML để viết hướng dẫn nấu ăn đẹp mắt nhưng thiếu bộ lọc làm sạch mã độc (Sanitization). Kẻ tấn công có thể chèn các đoạn script độc hại vào công thức công khai, khi người dùng khác mở ra xem sẽ bị đánh cắp thông tin cookie hoặc token.
*   **Xóa chéo công thức:** Người dùng A có thể gửi yêu cầu xóa hoặc chỉnh sửa nội dung công thức nấu ăn do Người dùng B tạo ra bằng cách gửi đè dữ liệu kèm ID công thức của người B.

---

## 6. Module: Shopping List (Danh sách mua sắm)

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Mua xong nhưng không nhập kho:** Người dùng xách giỏ đi chợ, bấm đánh dấu "Đã mua" cho toàn bộ danh sách 10 món đồ. Tuy nhiên, sau khi hoàn tất danh sách mua sắm, hệ thống không tự động cộng các món đồ này vào Inventory (tủ lạnh) của gia đình họ, bắt buộc họ phải vào Module Inventory để tự tay gõ nhập kho lại từ đầu.
*   **Không gom nhóm nguyên liệu trùng lặp:** Thực đơn tuần yêu cầu món Phở (cần 500g thịt bò) và món Bò Kho (cần 1kg thịt bò). Thay vì tự động gộp lại thành một dòng "Thịt bò: 1.5kg" trong Shopping List, hệ thống lại hiển thị 2 dòng thịt bò riêng biệt ở 2 vị trí khác nhau, khiến người đi chợ dễ mua thiếu hoặc phải đi lại nhiều lần tại một quầy hàng.
*   **Không đồng bộ chi phí thực tế:** Người dùng nhập giá tiền thực tế của các món đồ đã mua trong Shopping List để lưu vết, nhưng các giá trị tài chính này không được tự động đồng bộ và cập nhật sang Module Báo cáo tài chính (Reports) của gia đình.

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Giao diện đi chợ không tối ưu cho một tay:** Người dùng ở siêu thị một tay xách giỏ, một tay cầm điện thoại. Các nút bấm đánh dấu "Đã mua" (Checkbox) được thiết kế quá nhỏ, nằm sát mép màn hình, hoặc nút xác nhận nằm tít phía trên góc màn hình cực kỳ khó thao tác bằng một ngón cái.
*   **Thiếu phân loại theo quầy hàng siêu thị:** Danh sách mua sắm hiển thị lộn xộn theo thứ tự nhập vào (ví dụ: Rau cải -> Nước giặt -> Thịt heo -> Kem đánh răng -> Hành lá). Người dùng phải đi vòng qua vòng lại giữa các quầy thực phẩm tươi sống, quầy hóa mỹ phẩm nhiều lần vì các mặt hàng cùng loại không được tự động gom nhóm lại với nhau.
*   **Không dự tính được tổng tiền:** Shopping List không hiển thị tổng chi phí dự kiến trước khi đi chợ dựa trên đơn giá trung bình của các lần mua trước đó, khiến người dùng không chủ động được ngân sách mang theo.

### Edge Cases (Trường hợp ngoại lệ)
*   **Xung đột thao tác trực tiếp tại siêu thị (Realtime Concurrency):** Người chồng đang đi siêu thị cầm điện thoại đánh dấu "Đã mua" món cá hồi và đang thanh toán. Cùng lúc đó ở nhà, người vợ thấy không cần ăn cá hồi nữa nên bấm nút "Xóa" cá hồi khỏi danh sách. Hệ thống không xử lý xung đột này dẫn đến việc người chồng mua về nhưng trên app đã biến mất không dấu vết.
*   **Nhập giá tiền và số lượng dị thường:** Người dùng nhập giá của một bó rau là `-50,000`đ hoặc số lượng mua là `0.00001` cái tủ lạnh.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **Mất sạch dữ liệu khi mất sóng siêu thị (Offline-first failure):** Siêu thị thường là các tòa nhà lớn hoặc tầng hầm có sóng điện thoại cực kỳ yếu hoặc mất kết nối mạng hoàn toàn. Nếu ứng dụng không hỗ trợ lưu trữ tạm thời dưới thiết bị (Offline cache/IndexedDB) để người dùng vẫn tích chọn được đồ đã mua và tự động đồng bộ lại khi có mạng, người dùng sẽ không thể sử dụng ứng dụng khi đang đi chợ thực tế.
*   **Rò rỉ danh sách mua sắm qua IDOR:** Người dùng của gia đình khác có thể lấy cắp danh sách mua sắm, thói quen tiêu dùng và địa điểm siêu thị thường lui tới của gia đình bạn thông qua việc quét mã API của Shopping List.

---

## 7. Module: Reports (Báo cáo & Thống kê)

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Lệch múi giờ trong thống kê chi tiêu (Timezone Offset Bug):** Máy chủ (Server) hoạt động ở múi giờ UTC. Người dùng ở Việt Nam (UTC+7) thực hiện thanh toán hóa đơn đi chợ vào lúc 23:30 ngày 31/12/2026. Do không xử lý đồng bộ múi giờ, giao dịch này bị ghi nhận trên hệ thống vào ngày 01/01/2027 của năm sau, dẫn đến toàn bộ báo cáo tài chính của cả 2 năm bị sai lệch.
*   **Thống kê dinh dưỡng sai lệch do thay đổi quy mô gia đình:** Báo cáo lượng calo tiêu thụ trung bình trên mỗi thành viên được tính bằng tổng lượng thực phẩm chia cho số lượng thành viên hiện tại. Khi gia đình có biến động (thêm người hoặc bớt người), hệ thống áp dụng số lượng thành viên mới cho cả các tháng trong quá khứ, làm sai lệch dữ liệu lịch sử.
*   **Sai số làm tròn số thập phân:** Sử dụng kiểu dữ liệu không chính xác để tính toán tiền tệ hoặc lượng calo (ví dụ dùng float/double thay vì decimal/numeric), dẫn đến việc cộng dồn hàng nghìn giao dịch nhỏ bị lệch vài nghìn đồng so với số tiền thực tế.

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Biểu đồ rối rắm, không đọc được trên màn hình nhỏ:** Biểu đồ đường, biểu đồ cột hiển thị quá nhiều dữ liệu chi tiết của 30 ngày trên một khung hình điện thoại, các nhãn chữ (labels) đè lên nhau chữ tác đánh chữ tộ, không thể phóng to/thu nhỏ hoặc chạm để xem chi tiết.
*   **Thiếu tùy chọn xuất dữ liệu báo cáo:** Người dùng muốn tải báo cáo chi tiêu hàng tháng về dưới dạng file PDF để in ra hoặc file Excel/CSV để tự tính toán nâng cao nhưng hệ thống không hỗ trợ, bắt buộc họ chỉ được xem trực quan trên app.
*   **Báo cáo khô khan, thiếu tính năng cảnh báo và tư vấn:** Hệ thống chỉ đưa ra các biểu đồ số liệu khô khan, thiếu đi các dòng phân tích thông minh mang tính thực tế gia đình như: "Gia đình bạn đã chi tiêu vượt ngân sách 15% so với tháng trước", hoặc "Thực phẩm bị lãng phí nhiều nhất tháng này là Rau xanh".

### Edge Cases (Trường hợp ngoại lệ)
*   **Lỗi chia cho 0 (Division by Zero) ở tài khoản mới:** Gia đình mới đăng ký tài khoản, chưa từng mua sắm bất kỳ mặt hàng nào hoặc chưa có thành viên nào. Khi truy cập trang Báo cáo, hệ thống cố gắng tính toán các tỷ lệ phần trăm tiêu thụ và bị crash màn hình (màn hình trắng) do thực hiện phép chia cho 0.
*   **Lọc khoảng thời gian vô lý:** Người dùng chọn bộ lọc báo cáo Từ ngày `01/01/2027` Đến ngày `01/01/2020` (ngày bắt đầu lớn hơn ngày kết thúc), hoặc chọn khoảng thời gian quá lớn (100 năm) khiến máy chủ phải xử lý lượng dữ liệu khổng lồ dẫn đến lỗi hết thời gian chờ (Timeout) hoặc treo ứng dụng.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **Khai thác lỗ hổng SQL Injection qua bộ lọc báo cáo:** Các tham số lọc báo cáo (ví dụ lọc theo Danh mục thực phẩm, sắp xếp theo tên cột `ORDER BY`, khoảng thời gian) được gửi trực tiếp vào câu lệnh truy vấn cơ sở dữ liệu mà không qua cơ chế tham số hóa bảo mật (Parameterized Queries). Kẻ tấn công có thể chèn các mã SQL để đọc trộm toàn bộ bảng dữ liệu người dùng.
*   **Rò rỉ thông tin tài chính nhạy cảm:** API truy xuất dữ liệu báo cáo không kiểm tra quyền hạn của User, cho phép bất kỳ tài khoản nào cũng có thể lấy được dữ liệu tổng quan chi tiêu của các gia đình khác chỉ bằng việc thay đổi tham số gia đình trên API.

---

## 8. Module: Admin Dashboard

### Functional/Logic Bugs (Lỗi chức năng & Luồng nghiệp vụ)
*   **Xóa vĩnh viễn không có xác nhận nhiều lớp:** Admin hệ thống vô tình bấm vào nút "Xóa" một Gia đình hoặc một Người dùng trên bảng quản trị. Hệ thống lập tức thực hiện xóa cứng (Hard Delete) toàn bộ dữ liệu liên quan khỏi database mà không qua cơ chế thùng rác (Soft Delete/Archive) hoặc không bắt buộc gõ chữ xác nhận (ví dụ: gõ chữ "XÓA" để xác nhận), dẫn đến việc mất mát dữ liệu khách hàng không thể phục hồi.
*   **Treo hệ thống khi đếm dữ liệu trực tiếp (Direct Count Query):** Khi số lượng người dùng hệ thống tăng lên hàng trăm nghìn, trang chủ của Admin Dashboard thực hiện chạy các câu lệnh SQL đếm trực tiếp (`SELECT COUNT(*)`) trên các bảng dữ liệu lớn không có index hoặc không được lưu tạm (Cache). Điều này làm nghẽn toàn bộ kết nối cơ sở dữ liệu, khiến toàn bộ ứng dụng của người dùng thông thường bị treo mỗi khi Admin đăng nhập vào Dashboard.

### UX/UI Issues & Inconveniences (Bất tiện & Trải nghiệm người dùng)
*   **Hệ thống hoạt động mù (No Audit Log):** Dashboard không có lịch sử ghi nhận hoạt động của các Admin (Audit Log). Khi có một sự cố xảy ra (ví dụ: một tài khoản người dùng bị khóa đột ngột hoặc một công thức hệ thống bị xóa), không thể tra cứu được Admin nào đã thực hiện hành động đó, vào lúc nào và từ địa chỉ IP nào.
*   **Giao diện quản trị không hỗ trợ thiết bị di động:** Giao diện Dashboard được thiết kế cứng nhắc cho màn hình máy tính lớn. Khi hệ thống gặp sự cố khẩn cấp lúc Admin đang ở ngoài đường, việc mở điện thoại lên để thực hiện thao tác khóa tài khoản phá hoại hoặc reset cấu hình hệ thống là bất khả thi vì giao diện bị co rúm, tràn viền không thể nhấn được nút.
*   **Thiếu bảng điều khiển trực quan về trạng thái lỗi hệ thống:** Dashboard chỉ hiển thị các số liệu kinh doanh (User, Family), thiếu đi phần giám sát lỗi hệ thống thực tế (ví dụ: Tỷ lệ API lỗi 500 tăng cao, số lượng email gửi thất bại...) để Admin phát hiện sớm sự cố kỹ thuật trước khi người dùng khiếu nại.

### Edge Cases (Trường hợp ngoại lệ)
*   **Tự sát quyền lực (Admin Suicide):** Hệ thống chỉ có duy nhất một tài khoản Siêu Admin (Super Admin). Tài khoản này thực hiện hành động tự hạ quyền của chính mình hoặc tự khóa tài khoản của mình. Hệ thống rơi vào trạng thái tê liệt hoàn toàn vì không còn tài khoản quản trị nào có quyền mở khóa.
*   **Tràn dữ liệu do spam đăng ký tài khoản giả:** Kẻ xấu sử dụng script tạo hàng triệu tài khoản người dùng và gia đình ảo trong vài giờ. Admin Dashboard không có cơ chế phát hiện bất thường (Anomalous Activity Detection) hoặc không có công cụ cho phép Admin lọc và xóa hàng loạt (Bulk Delete) các tài khoản rác này một cách nhanh chóng.

### Security/Data Integrity (Bảo mật & Toàn vẹn dữ liệu)
*   **API quản trị không được bảo vệ từ Backend:** Hệ thống chỉ ẩn các nút bấm, ẩn menu "Admin Dashboard" trên giao diện Frontend đối với người dùng thường. Tuy nhiên, các endpoint API của Admin (ví dụ: `/api/admin/users/delete`) lại không được cấu hình Middleware kiểm tra quyền lực ở phía Backend. Bất kỳ người dùng thường nào có chút kiến thức kỹ thuật đều có thể gửi trực tiếp request đến các endpoint này để thực hiện quyền phá hoại như một Admin.
*   **Thời gian sống của phiên Admin quá dài:** Phiên đăng nhập (Session) của tài khoản Admin được cấu hình tồn tại vô hạn hoặc quá dài (nhiều tuần). Nếu Admin quên đăng xuất trên máy tính công cộng hoặc máy tính cá nhân bị người khác mượn sử dụng, toàn bộ hệ thống quản trị sẽ bị phơi bày trước nguy cơ phá hoại cực lớn.
