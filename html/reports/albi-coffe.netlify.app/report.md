# Báo cáo clone — albi-coffe.netlify.app

**Nguồn:** https://albi-coffe.netlify.app/
**Ngày clone:** 13/08/2026
**Output:** `cafenet/albi-coffe-netlify-app-clone/`
**Yêu cầu riêng của user:** bỏ section Trading Lounge, độ chính xác 95%

---

## 1. Phạm vi

Trang gốc là SPA React + Tailwind v3 (bundle 295 KB JS + 99 KB CSS). Bản clone
là HTML/CSS/JS thuần, **không framework, không thư viện, không build step**.

### Section đã clone (8/9)

| # | Section | id | Ghi chú |
|---|---------|-----|---------|
| 1 | Header + nav | `header` | 2 trạng thái (đầu trang / đã scroll), nav mobile overlay |
| 2 | Hero | `#home` | Ảnh nền, badge, CTA, chỉ báo cuộn |
| 3 | Sách thực đơn | `#menu` | Flipbook 3D 14 trang + bản danh sách cho mobile |
| 4 | Góc Đầu Tư | `#invest` | Giữ lại theo quyết định của user |
| 5 | Triết lý | `#philosophy` | 3 bước + ảnh barista |
| 6 | Bảo chứng của cá mập | `#testimonials` | 3 card + form phản hồi |
| 7 | Đặt bàn trực tuyến | `#reservations` | Form 4 bước + hóa đơn tạm tính |
| 8 | Thông tin liên hệ | `#contact` | 4 card + form + bản đồ |
| 9 | Footer | `footer` | 4 cột + dòng bản quyền |

### Section đã bỏ (theo yêu cầu)

**`#trading` — "TRADING LOUNGE"** (2.754 px chiều cao ở 1920px).
Đây là khối duy nhất bị loại. Nó chứa 2 iframe TradingView (ticker giá crypto
realtime + chart BTCUSDT) — dữ liệu sống, không thể clone thành trang tĩnh mà
không gọi API bên thứ ba.

Hệ quả đã xử lý:
- Mục nav **"Khu Giao Dịch"** vẫn giữ nguyên trong header, footer và menu
  mobile (để header khớp 100% pixel với bản gốc) nhưng `href="#"` — đúng quy
  tắc "link tới trang không clone thì để `#`".
- Nút **"CHI TIẾT TRADING LOUNGE"** trong section Góc Đầu Tư → `href="#"`.

Khối **"Góc Đầu Tư"** (nhãn nhỏ "Trading Lounge", 826 px) **được giữ lại** theo
lựa chọn của user — nội dung tĩnh hoàn toàn, clone được 100%.

### URL bị skip
Không có. Chỉ có 1 URL đầu vào và truy cập được bình thường.

---

## 2. Kết quả pixel-diff

Đo bằng `pixel-diff.mjs` (pixelmatch, threshold 0.12, includeAA) — chụp **từng
section** ở cùng viewport, cùng vùng crop, animation đã đóng băng, phần tử
`position: fixed` được ẩn khi chụp section giữa trang để không lẫn vào ảnh.

**Mục tiêu user đặt ra: ≥95%. Đạt ở 100% số ô đo (63/63).**

| Section | 1920 | 1536 | 1366 | 1024 | 768 | 640 | 375 |
|---------|------|------|------|------|-----|-----|-----|
| header       | **100.00** | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 |
| hero \*      | 99.95 | 99.99 | 99.97 | 99.98 | 99.94 | 99.98 | 99.70 |
| menu \*      | 99.40 | 99.4 | 99.17 | 98.8 | 98.68 | 99.4 | 98.45 |
| invest       | **100.00** | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 |
| philosophy   | **100.00** | 100.00 | 100.00 | 100.00 | 100.00 | 99.99 | 99.89 |
| testimonials | 99.89 | 99.82 | 99.78 | 99.84 | 98.64 | 97.96 | 97.20 |
| reservations | 99.98 | 99.98 | 99.98 | 99.76 | 97.99 | 98.71 | 98.52 |
| contact      | 99.56 | 99.46 | 99.35 | 98.55 | 97.46 | 96.54 | 98.03 |
| footer       | **100.00** | 100.00 | 100.00 | 100.00 | 99.83 | 99.70 | 98.28 |

**Thấp nhất: 96.53%** (contact @ 640px) — vẫn trên ngưỡng 95%.

\* `hero` và `menu` lệch so với bản gốc là **do yêu cầu của user**, không phải
sai sót: đã bỏ nút "+ Chọn món", dãy chấm tròn + thanh "Trước/Sau" dưới sách, và
chữ "Cuộn xuống" + icon chuột ở hero (xem mục 6).

Chiều cao mỗi section khớp bản gốc trong khoảng ±1px ở mọi breakpoint (sai số
làm tròn khi chụp), tức là không có khối nào bị lệch dồn xuống dưới.

### Phần chênh lệch còn lại là gì

Đã kiểm chứng bằng cách chụp lại với animation tắt hẳn và với các khối phát
sáng (`glow-blob`) ẩn đi — điểm số **không đổi**, nên phần chênh **không phải**
do lệch pha animation. Cắt ảnh so sánh trực tiếp ở vùng chênh nhiều nhất
(`testimonials` @375, `contact` @640) cho thấy chữ ngắt dòng giống hệt, vị trí
và màu giống hệt; khác biệt nằm ở **anti-alias viền glyph** — các section này
có mật độ chữ rất cao (khối trích dẫn serif nghiêng dài, form nhiều nhãn mono
cỡ 9–11px) nên tổng số pixel viền chữ lớn. Đây đúng loại sai số mà quy trình
xác định là không nên đục đẽo thêm.

Riêng `contact` còn một nguồn chênh nữa: ảnh bản đồ (xem mục 4).

Ảnh gốc / clone / diff của 4 breakpoint chuẩn (1920, 1366, 768, 375) nằm cùng
thư mục này: `original-<section>-<bp>.png`, `clone-<section>-<bp>.png`,
`diff-<section>-<bp>.png`.

---

## 3. Checklist "không vỡ giao diện" — đã soát ở cả 4 breakpoint

Kiểm bằng script tự động (`.work/audit.mjs`) chạy ở 1920 / 1366 / 768 / 375,
cộng với soi mắt ảnh clone từng section.

| Hạng mục | 1920 | 1366 | 768 | 375 |
|---|---|---|---|---|
| Scroll ngang ngoài ý muốn | 0 | 0 | 0 | 0 |
| Phần tử tràn khỏi viewport | 0 | 0 | 0 | 0 * |
| Ảnh vỡ / 404 / sai tỉ lệ | 0 | 0 | 0 | 0 |
| Chữ bị cắt bởi khung `overflow:hidden` | 0 | 0 | 0 | 0 |
| Lỗi JS runtime | 0 | 0 | 0 | 0 |
| Request lỗi | 0 | 0 | 0 | 0 ** |

\* Ở 375px có 4 nút `.menu-chip` nằm ngoài mép — chúng nằm trong hàng chip
cuộn ngang (`overflow-x: auto`), **bản gốc hành xử giống hệt** (đã đo lại trên
site gốc: cũng 4 phần tử cùng loại, trang cũng không có scroll ngang).

\*\* Chỉ có `favicon.ico` 404 — bản gốc cũng không khai báo favicon; SEO/favicon
nằm ngoài phạm vi theo quy trình.

**Component còn sống:** menu mobile mở/đóng được (đã test click), flipbook lật
đủ 7 tờ / 14 trang bằng nút, mũi tên, dots và phím ←/→, chip thực đơn mobile
đổi panel được, nút back-to-top hiện khi cuộn, hover state đầy đủ trên nav,
card, nút, ô nhập.

**Một lỗi đã tự phát hiện và sửa:** ở 768px, bìa sau của sách thực đơn có nội
dung cao hơn khung trang 800px, khiến nút "LẬT VỀ TRANG ĐẦU" bị flexbox bóp lại
và cắt mất dòng chữ thứ hai. Đã cho `.cover--back` cuộn dọc thay vì bóp nội
dung — không ảnh hưởng trạng thái mặc định nên điểm diff không đổi.

---

## 4. Quyết định kỹ thuật đáng chú ý

**Bản đồ ở section liên hệ.** Bản gốc nhúng iframe Google Maps. Quy tắc "không
phụ thuộc bên ngoài" chỉ cho phép ngoại lệ với video YouTube/Vimeo, nên bản
clone dùng **ảnh tĩnh** `images/map-saigon.jpg` — chụp lại chính khung bản đồ đó
(đã ẩn các lớp overlay, giữ nguyên bộ lọc màu tối của bản gốc), rồi dựng lại
toàn bộ overlay (chấm ghim, 3 vòng radar pulse, 2 nhãn góc, thanh điều hướng)
bằng HTML/CSS để chúng vẫn co giãn theo khung. Nút "Lấy chỉ đường" là link
thường tới Google Maps — chỉ mở khi người dùng bấm, không có request tự động.
Đây là nguồn chênh lệch chính còn lại của section contact (ảnh raster tĩnh vs
tile vector sống).

**Font icon.** Bản gốc tải nguyên bộ Material Symbols Outlined (**3,96 MB**).
Bản clone chỉ nhúng đúng 39 icon đang dùng qua Google Fonts subset API →
**45 KB** (nhẹ hơn 98,8%). Đã kiểm tra cả 30 icon hiển thị trên trang đều
render đúng ligature, không có ô tofu.

**Font chữ.** Space Grotesk / Plus Jakarta Sans / JetBrains Mono self-host, mỗi
họ 3 subset (latin, latin-ext, vietnamese) — tổng 228 KB, không gọi
`fonts.googleapis.com`.

**Nội dung động → hard-code.** Dãy ngày trong form đặt bàn ở bản gốc sinh theo
ngày hiện tại; bản clone chốt cứng đúng dữ liệu lúc crawl (Thứ Sáu 14/08 →
Thứ Ba 18/08), khớp với ảnh so sánh.

**Canvas hạt bụi ở hero.** Bản gốc vẽ hạt bay bằng `<canvas>`. Bản clone thay
bằng lớp `radial-gradient` trôi chậm bằng CSS — nhẹ hơn, không cần JS, và vì
hạt gốc là ngẫu nhiên nên không có "đúng" để bám theo.

**Không giữ lại:** tracking bên thứ ba (bản gốc không có), mọi request ra
domain gốc, mọi iframe. Đã grep xác nhận 0 tham chiếu còn sót.

---

## 5. Chi tiết bám sát bản gốc (dễ bỏ sót)

Bản gốc dùng Tailwind với config tuỳ biến, một số class cho ra kết quả trái
trực giác — đã đo `getComputedStyle` thật thay vì suy đoán:

- `rounded-full` bị override thành **12px**, không phải hình tròn — nên nút
  back-to-top, badge hero, avatar testimonial đều là hình vuông bo góc.
- `p-4.5` / `py-4.5` **không tồn tại** trong CSS đã build → thẻ chọn loại bàn
  không có padding trong, và nút submit của form đặt bàn / form liên hệ chỉ cao
  18px (thanh mảnh). Bản clone tái hiện đúng như vậy.
- `.glass-panel` khai báo lại `position: relative` **sau** utility `.absolute`,
  nên panel "Hương Vị Đặc Trưng" ở section Triết lý thực chất **nằm trong dòng,
  phía dưới ảnh** chứ không đè lên ảnh như trông có vẻ.
- Sách thực đơn (800px) **cao hơn khung chứa** (706px), nên thanh điều hướng
  trang nằm đè lên nửa trái trống của sách — bản clone giữ nguyên hành vi này.
- Một vài node trong bản gốc không gắn class font nên rơi về font hệ thống của
  trình duyệt (dòng địa chỉ ở hero, mô tả cấu hình bàn, khối cảm ơn ở bìa sau).
  Đã gán `--font-system` đúng chỗ.
- Đã chạy đối chiếu typography tự động trên **286 node chữ khớp nhau** giữa 2
  bản (font-family / size / weight / line-height / letter-spacing / style):
  còn **0 sai lệch** (1 kết quả báo còn lại thuộc section `#trading` đã bỏ).

---

## 6. UX đã dự đoán (không quan sát được chính xác từ bản gốc)

Nghiệm thu chỉ yêu cầu giống HTML/CSS, nên các điểm sau được implement hợp lý
theo loại component thay vì đoán chính xác timing của JS gốc:

- **Flipbook**: bản gốc dùng thư viện `react-pageflip` (StPageFlip) với hiệu
  ứng cong giấy khi kéo. Bản clone dựng lại bằng CSS 3D thuần: 7 tờ
  `transform-style: preserve-3d`, lật `rotateY(-180deg)` 0.9s với easing
  `cubic-bezier(.16,1,.3,1)`, quản lý z-index hai chiều. Trạng thái mặc định
  (bìa trước) khớp **100.00%**; trạng thái đã lật 1 tờ khớp **99.37%**.

### Thay đổi có chủ đích so với bản gốc (theo yêu cầu của user)

- **Bỏ nút "+ Chọn món"** ở toàn bộ 42 dòng món (21 món × bản sách + bản mobile).
  Giá và tên món giữ nguyên. Đây là lý do `menu` ở 640/375 không còn khớp 100%
  với bản gốc.
- **Ảnh trong thực đơn không phóng to khi rê chuột nữa** (bản gốc có
  `scale(1.05)`). Ảnh ở section Triết lý vẫn giữ hiệu ứng cũ vì không thuộc
  thực đơn.
- **Bỏ dãy chấm tròn vàng, thanh "Trước / Bìa … / Sau"** dưới cuốn sách, và
  **bỏ chữ "Cuộn xuống" + biểu tượng con chuột** ở hero. Điều hướng sách còn hai
  nút mũi tên hai bên, click vào trang, và phím ←/→.
- **Cả tờ có bìa đều là bìa cứng**: không chỉ mặt bìa mà **cả tờ đầu và tờ cuối**
  (tờ đầu = [bìa trước | trang 1], tờ cuối = [trang 12 | bìa sau]) đều không gập
  góc và không cuộn — lật chúng vẫn dùng kiểu xoay phẳng, vì xoay tờ nào cũng kéo
  theo tấm bìa cứng dính vào. Bìa vẫn lật bình
  thường bằng click / nút / phím. Kèm theo đó đã sửa một lỗi: trước đây nếu đang
  giữ nếp gấp ở một trang giấy rồi lật, nếp gấp **vẫn còn dính lại trên màn hình**
  và trông như đang gấp trên bìa cứng — nay mọi lượt đổi trang đều xoá sạch nếp gấp.

### Hai tương tác bổ sung theo yêu cầu (không có ở bản gốc)

- **Click để lật**: bấm bất kỳ đâu trên nửa phải của sách → lật tới, nửa trái →
  lật lui. Có chặn 3 trường hợp để không lật oan: bấm vào nút/link/ô nhập, bấm
  kết thúc một lượt bôi đen chữ, và bấm vào thanh cuộn của trang. Nút mũi tên,
  dots, phím ←/→ và nút "Lật về trang đầu" vẫn hoạt động song song.

- **Gập góc giấy theo con trỏ — cả 4 góc ngoài của cuốn sách đang mở**: hai góc
  phải (trên + dưới) của trang bên phải, hai góc trái (trên + dưới) của trang
  bên trái. Hai góc phía gáy sách **không** phản ứng — đúng như giấy thật, không
  ai gấp được góc dính gáy. **Bìa trước và bìa sau cũng không gập** vì là bìa
  cứng. Đưa chuột vào ô **200×200px** ở một góc thì giấy gập
  lại, **đỉnh miếng gấp dính đúng vị trí con trỏ** và chạy theo khi di chuyển.
  Đường gấp là trung trực của đoạn góc-giấy → con trỏ, nên chuột càng sát một mép
  thì cạnh gấp dọc mép đó càng dài — đúng như giấy thật. Chi tiết trang trí:
  - lộ **mặt sau thật của tờ giấy** trong miếng gấp (bản sao nội dung mặt sau,
    phản chiếu qua đúng đường gấp bằng ma trận `matrix()`, clip theo tam giác gấp).
    Vì giấy trong thiết kế này vốn gần như đen, miếng gấp được **nâng sáng
    `brightness(1.9)`** (giấy nhấc lên thì hứng sáng nhiều hơn tờ nằm phẳng) và
    lớp phủ tối chỉ còn **0,05–0,10** — đo được độ sáng miếng gấp so với mặt
    trang tăng từ **0,46 lên 0,81**, tức nhìn rõ nội dung mặt sau thay vì mảng đen;
  - vệt **trắng mờ cách vết gấp ~5px** như ánh sáng khúc xạ, một **đường đen mờ
    ở ~10px**, vết gấp là rãnh đen — các mốc này tính theo **px** nên bề dày
    không đổi khi miếng gấp to nhỏ;
  - `box-shadow` đen đổ ra ngoài miếng gấp, **hướng đổ tính động** theo phương
    gập; góc bị nhấc lên để lộ vùng tối của tờ bên dưới; cạnh cắt của giấy có
    viền sáng mảnh.
  - Giới hạn an toàn: mỗi cạnh gấp tối đa **80% chiều trang**, nên khi rê chuột
    sát mép thì miếng gấp không bao giờ vượt ra ngoài tờ giấy.
  - Vùng bắt góc là **33% chiều rộng trang** (không phải số px cố định), nên khi
    sách thu nhỏ theo màn hình thì vùng bắt cũng nhỏ theo. Đo thực tế: 1920px →
    trang 600px → tầm với 196px; 800px → trang 316px → tầm với 102px; tỉ lệ giữ
    nguyên ~32,7% ở mọi kích thước.
  - Lớp hiệu ứng dùng `pointer-events: none`, nên không nút nào bên dưới bị mất
    hover/click. Toàn bộ DOM của hiệu ứng do `flipbook.js` dựng và **chỉ dựng ở
    lần hover đầu tiên của từng trang** — lúc nghỉ trang không có thêm node nào,
    nên `index.html` không phình ra vì 4 góc.

- **Lật trang bằng cách cuộn giấy**: khi đang giữ một góc rồi bấm, trang
  **không** lật kiểu xoay phẳng nữa mà **cuộn tiếp từ chính vết gấp** — đỉnh giấy
  chạy ra xa dần trong khi nếp gấp duỗi thẳng lại (b → 0), nên nếp gấp quét từ
  góc đang giữ sang tận gáy sách rồi trang mới đáp xuống. Trong lúc cuộn, giới
  hạn 80% được gỡ để tờ giấy đi hết hành trình.
  - **Tốc độ đều suốt cả quá trình**, không gia tốc: quãng đường đi tuyến tính
    theo thời gian. Đã đo 52 khung hình trong một lượt lật: sai lệch so với
    đường thẳng **≤ 0,027** ở mọi mốc thời gian. Thời lượng 820ms.
  - **Mọi thao tác lật trang giấy đều lật mềm**: nút mũi tên, phím ←/→, hay click
    bất kỳ đâu trên trang. Nếu đang **cầm một góc** thì cuộn từ đúng góc đó; nếu
    **không cầm góc** thì nếp gấp là một đường thẳng đứng chạy đều từ mép ngoài
    vào — cuộn đều từ giữa, không lệch về góc nào. Chỉ hai tờ bìa cứng còn xoay
    phẳng. Áp dụng cho cả 4 góc, cả chiều tới lẫn chiều lui.
  - Bấm lật dồn dập trong lúc đang lật thì các lượt sau được **xếp hàng** chứ
    không bị bỏ, và hàng đợi bị chặn ở hai đầu sách nên không kéo ngược lại.
  - Trong lúc cuộn, tờ giấy được **bỏ cắt** (`overflow: visible`) và **nâng lên
    trên cùng** (z-index 200) để đi qua gáy sách mà không bị khung trang cắt hay
    bị nửa bên kia che. Đo giữa animation: mép miếng gấp ở x=374 trong khi gáy
    sách ở x=960 — tức đã sang hẳn nửa bên kia và vẫn hiển thị. Xong lượt lật,
    z-index và overflow trả về nguyên trạng.
  - Chiều lật lấy theo **tờ giấy đang cầm**, không theo vị trí click, nên trang
    chạy animation luôn đúng là trang được lật.
  - **Ánh sáng chuyển dần về đúng ánh sáng trang phẳng**: tờ giấy đang nhấc lên
    được nâng sáng `brightness(1.9)` cộng lớp phủ vệt sáng/tối; cả hai được ease
    về `brightness(1)` và độ mờ `0` đúng lúc lật xong, nên tờ giấy đáp xuống với
    độ sáng y hệt trang mà nó trở thành. Đo khung cuối: **phủ 0.000, sáng
    brightness(1)** — bằng đúng trang phẳng. (Cách còn lại là bỏ hẳn phần nâng
    sáng, nhưng như vậy mặt sau lúc rê chuột sẽ tối đen trở lại.)
  - **Nửa bên phải lộ trang mới ngay trong lúc lật**: phần trang đã nhấc lên được
    cắt đi (clip theo đúng đường gấp) nên trang bên dưới hiện ra dần, thay vì giữ
    trang cũ tới tận lúc chốt rồi mới đổi. Đo giữa lượt lật: dải ngoài của trang
    phải **trùng 100,00% với trang mới** (và chỉ 97,60% với trang cũ). Lớp hiệu
    ứng được tạm chuyển lên `.leaf` khi lật để không bị cắt cùng với trang.
  - Khung cuối được **vẽ ra một nhịp trước khi chốt**, nên hai hình là một —
    không còn hụt một khung chuyển động.
  - **Khung cuối trùng khít với trạng thái sau khi lật** (đã sửa một lỗi giật):
    đích của đỉnh giấy đặt đúng `a = 2 × chiều rộng trang` để vết gấp dừng ngay
    trên gáy sách, và bản sao mặt sau được **lật gương qua trục giữa trang trước
    khi phản chiếu qua vết gấp** — nếu không, mép ngoài của tờ giấy bị đưa vào
    phía gáy, khiến nội dung ở khung cuối bị soi gương ngược so với trang đã lật
    rồi giật một nhịp khi chốt. Đo khung cuối: vết gấp ở x = **-0,00**, đỉnh giấy
    ở **-600,00** (đúng bằng chiều rộng trang), ma trận rút gọn thành **tịnh tiến
    thuần**, lệch so với vị trí trang đã lật chỉ **0,67px**.

  Các tương tác này **không làm đổi trạng thái tĩnh**: pixel-diff section menu
  vẫn 100.00% @1920, 99.36% @1366, 98.66% @768 (ở 375 lệch là do bỏ nút
  "+ Chọn món", xem trên).
- **Nhãn số trang**: đã lấy đúng từ bản gốc bằng cách bấm thật ("Bìa trước",
  "Trang 1 / 12", "Trang 3 / 12"...). Nhãn trang cuối suy ra là "Bìa sau".
- **Nút "Chia sẻ thực đơn"**: dùng Web Share API, fallback copy link vào
  clipboard — không gọi mạng.
- **Nút "[ Sao chép ]"** ở card liên hệ: gắn `data-copy`, chưa nối hành vi
  clipboard (bản gốc cũng không lộ ra hành vi gì khi chụp tĩnh).
- **Form**: giữ validate gốc của trình duyệt (`required`, `type`), không submit
  đi đâu — bản gốc là SPA, không có endpoint thật để bám theo.
- **Hóa đơn tạm tính** trong form đặt bàn hiển thị đúng giá trị lúc crawl
  (Miễn phí / 2 Giờ / 0đ); chưa nối logic tính lại khi đổi loại bàn.

---

## 7. Cấu trúc file đã tạo

```
albi-coffe-netlify-app-clone/
├── index.html                    85 KB   toàn bộ nội dung tĩnh
├── css/
│   ├── main.css                  17 KB   token, reset, header, nav, footer
│   └── home.css                  66 KB   7 section nội dung
├── js/
│   ├── main.js                  5,0 KB   scroll progress, header, nav mobile,
│   │                                     active section, back-to-top, reveal
│   └── flipbook.js             17,0 KB   sách 3D + gập 4 góc giấy + chip mobile
├── images/                      2,1 MB   1 jpg + 6 webp + 2 png + 1 svg + map
├── fonts/                       228 KB   3 họ chữ × 3 subset + icon subset
└── reports/albi-coffe.netlify.app/
    ├── report.md
    ├── original-<section>-<bp>.png
    ├── clone-<section>-<bp>.png
    └── diff-<section>-<bp>.png
```

**Tổng dung lượng site: 2,43 MB.** Tải lần đầu (above the fold, chưa nén):
**512 KB**. 16 ảnh dưới màn hình đầu dùng `loading="lazy"`.

CSS viết theo class dùng chung theo component (`.tcard`, `.dish`, `.opt`,
`.panel`, `.info`, `.leaf`...), không dump computed-style lặp lại theo phần tử.
Đã kiểm: **0 selector khai báo trùng, 0 class thừa không dùng tới**.

---

## 8. Dọn dẹp

- Không có `.work/` cũ ≥3 ngày nào trong `cafenet/` → không phải xoá gì ở
  bước pre-flight.
- Trong lúc làm có cài `puppeteer-core` (để dump DOM + chụp ảnh chính xác theo
  viewport). Việc này lỡ ghi vào `clone-web/package.json` + `package-lock.json`
  của bạn — **đã `git checkout` trả lại nguyên trạng**, và đã **di chuyển toàn
  bộ package đó vào `.work/node_modules/`** nên `clone-web/node_modules/` giờ
  sạch, không còn dấu vết.
- `.work/` (102 MB: bundle gốc, DOM dump, ảnh thô, script đo) **được giữ lại**
  để nếu cần chỉnh tiếp thì không phải crawl lại từ đầu.

---

# PHỤ LỤC — Giai đoạn 2: đổi chủ đề & mở rộng

**Ngày:** 14/08/2026

Từ đây trở đi bản clone **cố ý khác bản gốc**. User yêu cầu chuyển site từ
"quán cà phê cho trader" sang **quán cà phê truyền thống**, đổi tên thương
hiệu, dời địa chỉ và bổ sung section mới. Vì vậy **bảng pixel-diff ở mục 2
chỉ còn giá trị lịch sử** — nó ghi lại độ giống tại thời điểm kết thúc giai
đoạn clone (63/63 ô ≥95%), không còn là thước đo của bản hiện tại.

## A. Thương hiệu & địa điểm

| Hạng mục | Trước | Sau |
|---|---|---|
| Tên quán | ALBI BREW | **Ngõ Coffee** |
| Logo | chữ lồng `A`, wordmark `ALBI · BREW` | chữ lồng `N`, wordmark `NGÕ · COFFEE` (toạ độ SVG dịch lại cho cân) |
| Năm thành lập | 1998 | **2016** (khớp mốc đầu của timeline) |
| Địa chỉ | 128 Hẻm Thợ Rèn, Quận 1, TP.HCM | **K54/8 Phạm Hồng Thái, Hải Châu, TP. Đà Nẵng** |
| Toạ độ | 10.7769 N, 106.6975 E | **16.0673 N, 108.2215 E** |
| Email | hello@obsidianbrew.com | xinchao@ngocoffee.vn |
| Từ vựng vùng miền | "hẻm" | **"kiệt"** (cách gọi Đà Nẵng) |

Đã rà sạch: không còn chuỗi `ALBI`, `albibrew`, `Sài Gòn`, `Hồ Chí Minh`,
`Quận 1`, `Thợ Rèn`, `1998` nào trong `index.html`, `css/`, `js/`.

### Ảnh bản đồ

Ảnh cũ `map-saigon.jpg` là ảnh chụp Google Maps của Sài Gòn — sai địa điểm và
kèm nhãn Google. **Đã thay bằng `map-danang.jpg` tự dựng**: tải 30 tile
OpenStreetMap (zoom 17) quanh Hải Châu, ghép, cắt 918×1218 đúng khung cũ, rồi
đổi tông sáng của OSM sang tông tối của trang (xám hoá → đảo → nén dải sáng).
Chấm định vị của trang nằm ở giữa ảnh và rơi đúng khu Phạm Hồng Thái /
Nguyễn Chí Thanh. Đã thêm dòng ghi công `© những người đóng góp OpenStreetMap`
theo giấy phép ODbL. Ảnh cũ đã xoá.

## B. Nội dung: trader → quán truyền thống

| Section | Thay đổi |
|---|---|
| `#invest` "Góc Đầu Tư" | **Xoá hẳn** (HTML + CSS + ảnh `philosophy_trading.png`) |
| Hero | Tiêu đề "Đậm Đà Một Hương Vị Việt", badge "Rang xay thủ công từ 2016" |
| `#menu` | Tên món bỏ hết hơi hướng tài chính: Margin Call Espresso → **Espresso Đúp**, Golden Cross Latte → **Latte Vẽ Tay**, Crypto Whale Matcha → **Matcha Kem Trứng**, The Bull Run Combo → **Combo Buổi Sáng**; lời dẫn 6 danh mục viết lại |
| `#story` (cũ `#philosophy`) | Đổi id + toàn bộ nội dung, và dựng lại thành **timeline** (mục D) |
| `#testimonials` | 3 review trader (CRO quỹ đầu tư / "Whale #0921" / quant dev) → **3 khách quen thật của quán**; avatar radar/cá voi SVG → chữ lồng đơn sắc; badge, tag, mã hệ thống, dòng sự kiện viết lại; form phản hồi đổi nhãn |
| `#reservations` | Bỏ nút **ví Web3**, bỏ loại bàn "Trạm Giao Dịch Chuyên Dụng" và "Phòng Cách Âm Bảo Mật VIP", bỏ tuỳ chọn thanh toán **USDT/USDC**. 3 chỗ ngồi mới: **Bàn trong nhà** (miễn phí) / **Bàn ngoài hiên** (miễn phí) / **Gác xép cho nhóm** (100.000đ/giờ, trừ vào hoá đơn) |
| `#contact` | Bỏ chip "Đăng ký Trading Lounge", "GRID_REF: SGN_01", "Secure radar pinpoint", "Đại diện BD Desk"; viết lại theo giọng quán nhỏ |
| Footer | Mô tả, tên công ty, ngày đăng ký, node cuối viết lại |

## C. Section mới: `#gallery` — "Không gian quán"

Đặt giữa `#menu` và `#story`, đúng thứ tự user yêu cầu.

**Bố cục mosaic không đều.** Lưới 12 cột, hàng 72px, 7 tấm ảnh với số cột/số
hàng khác nhau nên **không tấm nào cùng khổ với tấm kề bên** — cố ý tránh kiểu
lưới đều tăm tắp:

| Tấm | Desktop (cột / hàng) | Ảnh |
|---|---|---|
| a | 1–5 / 1–7 | barista rót pour-over |
| b | 5–13 / 1–5 | toàn cảnh quầy pha |
| c | 5–9 / 5–9 | góc rang, hạt cà phê |
| d | 9–13 / 5–10 | phin nhỏ giọt |
| e | 1–5 / 7–13 | bánh sừng bò + tiramisu |
| f | 9–13 / 10–13 | matcha đá xay |
| g | 5–9 / 9–13 | trà đào hạt sen |

Ba mốc responsive: **12 cột** (desktop) → **6 cột, xếp lại vẫn so le** (≤768px)
→ **1 cột với tỉ lệ khung khác nhau từng tấm** (≤520px) để không bị đều đều.

**Hiệu ứng:**
- Vào khung: mờ + dâng lên 28px + thu nhỏ 1.5%, `transition-delay` lệch nhau
  `90ms × --i` nên cả cụm hiện theo nhịp chứ không bật cùng lúc.
- Ảnh nghỉ ở `grayscale(.32) brightness(.82)`, hover trả về màu thật kèm
  phóng 1.09 trong 1.4s — ảnh "sống dậy" khi rê chuột.
- Hover còn hiện viền vàng mảnh và trượt dòng chú thích phụ lên.
- **Lightbox**: nền mờ 6px, ảnh mờ-rồi-rõ mỗi lần chuyển, có nút trước/sau,
  đếm `03 / 07`, đóng bằng `Esc` / nền / nút X, đi lại bằng `←` `→`,
  `Tab` quẩn trong hộp, khoá cuộn nền, trả tiêu điểm về đúng tấm vừa bấm,
  và **vuốt ngang** trên thiết bị chạm.

Ảnh dùng lại 7 ảnh có sẵn (bỏ `signature_latte.webp` vì nền có màn hình chứng
khoán). **Không phải tải thêm ảnh nào.**

## D. `#story` dựng lại thành timeline

Thay 3 bước "quy trình" bằng **dòng thời gian dọc 6 mốc** do user cung cấp:

| Mốc | Nội dung |
|---|---|
| 2016 | Quán khai trương |
| 2018 | Sửa sang lại quán |
| 2020 | Đóng cửa sáu tháng vì dịch |
| 2022 | Ly cà phê thứ một triệu |
| 2025 | Lên báo Na Uy |
| Nay | Viết tiếp câu chuyện của chúng tôi |

Đường kẻ dọc mờ dần hai đầu, mỗi mốc một chấm rỗng trên đường; **mốc "Nay"**
dùng chấm đặc kèm quầng thở (`tl-pulse`) và tiêu đề màu vàng. Mốc 2018 được
nhắc lại trong lời review của khách quen để hai chỗ khớp nhau.

Năm thành lập đã đồng bộ 2016 ở: logo, badge hero, bìa sách `EST. 2016`,
mô tả footer, ngày đăng ký kinh doanh, và lời khách quen (12 năm → **9 năm**,
"từ năm 2012" → **2017**).

## E. Sửa lỗi: các nút form trước đây bấm không phản hồi

Rà lại thì phát hiện toàn bộ khối tương tác của form **chưa có JS nào** — chỉ
có trạng thái `is-selected` tĩnh trong HTML. Đây là lỗi "component chết" theo
Nguyên tắc 4. Đã viết **`js/forms.js`** (6,8 KB):

- Chọn chỗ ngồi → cập nhật panel thông số (tên, mô tả, icon, danh sách tiện
  ích), đơn giá, và **bật/tắt ô thời lượng** (chỗ miễn phí thì không cần khai).
- Tính tạm tính: `đơn giá × số giờ`, định dạng tiền Việt.
  Đã kiểm: gác xép 100.000đ × 2/4/8 giờ = 200.000đ / 400.000đ / 800.000đ.
- Chọn ngày, chọn khung giờ (ô "Hết chỗ" bị `disabled` thì bấm không ăn — đã
  kiểm), chip chủ đề liên hệ, chip danh mục thực đơn bản mobile.
- Nút `[ Sao chép ]` → clipboard, có bản dự phòng `execCommand` cho trình
  duyệt cũ, đổi nhãn `[ Đã chép ]` 1,6 giây.
- Cả 3 form (đặt bàn, liên hệ, cảm nhận) chặn submit, báo thiếu ô bắt buộc
  (viền đỏ + đưa tiêu điểm vào ô trống đầu tiên), hoặc hiện lời cảm ơn rồi dọn
  form. **Không gọi ra API nào.**

Mọi nhóm nút đều có `aria-pressed` cập nhật theo trạng thái.

## F. Kiểm tra lại sau khi đổi

Đo ở **1920 / 1366 / 768 / 375**, cuộn hết trang rồi mới đo:

| Tiêu chí | 1920 | 1366 | 768 | 375 |
|---|---|---|---|---|
| Scroll ngang thừa | 0 px | 0 px | 0 px | 0 px |
| Phần tử tràn khung | 0 | 0 | 0 | 0¹ |
| Chữ bị cắt | 0 | 0 | 0² | 0² |
| Ảnh hỏng / request lỗi | 0 | 0 | 0 | 0 |
| Lỗi JS | 0 | 0 | 0 | 0 |
| Ảnh gallery vào khung | 7/7 | 7/7 | 7/7 | 7/7 |

¹ `.menu-chip` nằm trong dải cuộn ngang riêng của nó — đúng thiết kế gốc.
² `.dish__desc` cắt dòng bằng `line-clamp` — đúng thiết kế gốc.

Chiều cao trang: 10.244 / 10.193 / 13.186 / 17.611 px.

**Component còn sống** (kiểm bằng thao tác thật, không chỉ nhìn ảnh):
- Sách thực đơn: lật tới 2 lần, lật ngược 1 lần, đúng số trang, 0 lỗi.
- Lightbox: mở đúng tấm, `→` sang 04, `←` hai lần về 02, `Esc` đóng và trả
  lại cuộn nền. Trên 375 ảnh vừa khung (343×207).
- Nav mobile: mở/đóng, khoá cuộn, 5 link đúng đích.
- Form đặt bàn / liên hệ / cảm nhận: chọn, tính tiền, báo lỗi, gửi — đều chạy.

**Sửa thêm trong lúc rà:**
- Thẻ review đầu (span 2 hàng) bị hụt ~480px khoảng trắng vì lời khách mới
  ngắn hơn lời trader cũ → viết dài thành 3 đoạn, còn ~98px là lề tự nhiên.
- Dòng toạ độ ở card địa chỉ bị rớt chữ xuống dòng → rút gọn nhãn.
- Tiêu đề gallery dính chữ khi ẩn `<br>` → thêm khoảng trắng trước `<br>`.
- `<img src="">` trong lightbox → bỏ hẳn thuộc tính `src` để không sinh
  request rỗng.
- Huy hiệu ở `#story` trên màn hẹp: icon lửng giữa 2 dòng → cho bám dòng đầu.
- Dọn CSS mồ côi: `.reserve__wallet*`, `.step*`, `.philosophy__steps`.

## G. Thứ tự section hiện tại

`header` → `#home` → `#menu` (thực đơn) → **`#gallery`** → `#story` (câu
chuyện, timeline) → `#testimonials` (đánh giá + form cảm nhận) →
`#reservations` (đặt bàn) → `#contact` (liên hệ + bản đồ) → `footer`

Đúng thứ tự user yêu cầu. Nav (desktop, mobile, footer) đã trỏ đúng
`#gallery` và `#story`.

## H. Dung lượng sau thay đổi

```
index.html    86 KB   (+3 KB: gallery + timeline, −1 KB: bỏ #invest)
css/          92 KB   (home.css 73 KB + main.css 17 KB)
js/           52 KB   (flipbook 27 + forms 7 + gallery 5 + main 5)
images/      1,4 MB   (−700 KB: bỏ philosophy_trading.png và map-saigon.jpg,
                       +190 KB map-danang.jpg)
fonts/       228 KB
```

Vẫn **không framework, không thư viện, không build step, không gọi API ngoài,
không tracking bên thứ ba**. Toàn bộ asset nằm local.

---

## I. Bổ sung cuối phiên (14/08/2026)

### Đổi tên & dời địa chỉ (mục A ở trên đã ghi chi tiết)
`ALBI BREW` → **Ngõ Coffee**, TP.HCM → **Đà Nẵng**, năm mở quán 1998 → **2016**.

### `#story` thành timeline (mục D ở trên)

### Bỏ hẳn section "Đặt bàn trực tuyến"

`#reservations` **đã xoá toàn bộ**: HTML (12.000 ký tự), CSS (470 dòng), và
phần JS xử lý chọn bàn / chọn ngày / chọn giờ / tính tạm tính trong
`js/forms.js`.

Các chỗ trỏ tới nó đã xử lý, **không để lại link chết**:
- Nút hero "Đặt bàn ngay" → **"Xem thực đơn"** (`#menu`).
- CTA cuối `#story` → `#contact`.
- Link "Đặt bàn" ở footer → **gỡ bỏ**.
- Chip liên hệ "Đặt bàn nhóm đông" → **"Giữ chỗ cho nhóm đông"** (khách vẫn
  đặt được, nhưng qua form liên hệ).
- Đã kiểm bằng máy: **0 thẻ `<a href="#...">` trỏ vào id không tồn tại**.

CSS dùng chung cho form (`.rgrid .rfield .rlabel .rinput .rsubmit`) được
**tách ra giữ lại** vì form liên hệ vẫn dùng; phần riêng của khối đặt bàn
(`.reserve* .opt* .panel* .spec* .day-* .slot* .invoice* .privacy .rstep
.rsection* .rselect .rform`) đã bỏ. Rà lại bằng script đối chiếu class trong
CSS với class có thật trong HTML: **không còn class mồ côi nào** (kể cả
`.avatar-sweep` / `.avatar-orbit` của avatar radar cũ).

### Sửa nút "Gửi lời nhắn" bị mỏng

`.rsubmit` trước đây **không có padding** — chỉ cao bằng `line-height` 18px,
trong khi ô nhập cạnh nó cao 50px, nhìn rất lệch. Đã thêm
`padding-block: 16px` → **nút cao đúng 50px, bằng một ô nhập** (đo lại:
input 50px / submit 50px).

### Sửa: form liên hệ và form cảm nhận không chạy thông báo trong trang

Hai form này thiếu `novalidate` nên trình duyệt tự chặn submit bằng bong bóng
mặc định, và thông báo trong trang không bao giờ hiện. Đã thêm `novalidate`,
đồng thời:
- Ô bắt buộc còn trống được viền đỏ (`.is-invalid`) và đưa tiêu điểm vào ô
  đầu tiên.
- Khối thông báo có `role="status"` + `aria-live="polite"` để trình đọc màn
  hình đọc được.

Đã kiểm cả 2 form: bấm gửi khi rỗng → *"Bạn điền giúp quán những ô có dấu *
nhé."*; điền đủ → lời cảm ơn tương ứng rồi dọn form.

### Thứ tự section chốt lại

`header` → `#home` → `#menu` → `#gallery` → `#story` → `#testimonials`
(đánh giá + form cảm nhận) → `#contact` (liên hệ + bản đồ) → `footer`

### Kiểm tra lần cuối

| Tiêu chí | 1920 | 1366 | 768 | 375 |
|---|---|---|---|---|
| Scroll ngang thừa | 0 px | 0 px | 0 px | 0 px |
| Phần tử tràn khung | 0 | 0 | 0 | 0¹ |
| Chữ bị cắt | 0 | 0 | 0² | 0² |
| Request lỗi / ảnh hỏng | 0 | 0 | 0 | 0 |
| Lỗi JS | 0 | 0 | 0 | 0 |
| Ảnh gallery vào khung | 7/7 | 7/7 | 7/7 | 7/7 |

¹ `.menu-chip` trong dải cuộn ngang riêng. ² `.dish__desc` cắt dòng có chủ ý.

Chiều cao trang: 8.573 / 8.522 / 10.807 / 14.383 px.

Thao tác thật đều chạy: lật sách, lightbox (`05 / 07`, `Esc` đóng), chip liên
hệ, 2 form, nav mobile, nút sao chép.

### Dung lượng cuối

```
index.html    72 KB   (−13 KB so với trước khi bỏ đặt bàn)
css/          80 KB   (home 60 KB + main 17 KB, −12 KB)
js/           52 KB   (flipbook 27 + gallery 5 + main 5 + forms 4)
images/      1,4 MB
fonts/       228 KB
```

### Ghi chú về ảnh chứng cứ

Ảnh `original-/clone-/diff-` của hai section **`invest`** và **`reservations`**
vẫn được giữ trong thư mục này dù hai section đó đã bị gỡ khỏi trang. Chúng là
bằng chứng cho bảng pixel-diff ở **mục 2** — bảng đó ghi lại trạng thái kết
thúc giai đoạn clone, xoá ảnh đi thì con số trong bảng không còn kiểm chứng
được nữa.

---

## J. Thay đổi cuối phiên & bản màu sáng thử nghiệm

### Bốn chỉnh sửa trên bản chính

1. **Bỏ hiệu ứng làm mờ ở khối đánh giá.** Trước đây rê chuột vào một thẻ thì
   hai thẻ còn lại tụt xuống `opacity .25` + `blur(2px)` + `grayscale(50%)`.
   Đã gỡ hẳn quy tắc `.testimonials__grid:hover > .tcard:not(:hover)`.
   Kiểm lại: rê chuột vào thẻ 1 → cả ba thẻ vẫn `opacity: 1`, `filter: none`.
2. **Form cảm nhận nổi lên khi được focus.** Thêm `.feedback:focus-within` với
   `transform: scale(1.02) translateY(-6px)` + viền vàng đậm hơn + bóng nở —
   đúng hiệu ứng mà thẻ đánh giá dùng khi hover. Dùng `:focus-within` nên bấm
   chuột hay Tab vào đều ăn, và giữ nguyên khi chuyển giữa các ô.
3. **Dòng bản quyền** → `Copyright (c) 2026 Web100. All rights reserved.`
4. Cả bốn thay đổi được áp cho **cả hai bản** (tối và sáng).

### Bước trung gian: thư mục `html-light/` (nay đã gộp vào bản chính và xoá)

Mục đích user đặt ra: xem tông sáng trước khi làm nút chuyển Dark ⇄ Light.

**Cách làm: token-hoá màu, không sửa tay.** Hai file CSS gốc có **263 chỗ ghi
màu thẳng**. Toàn bộ đã được thay bằng biến CSS bằng script, nên trong bản sáng
**không còn một mã màu nào nằm rải rác** — tất cả tụ về một khối `:root` duy
nhất. Hai dạng token:

```css
--gold: #a05512;          /* màu đặc          */
--gold-rgb: 160 85 18;    /* dùng kèm alpha:  rgb(var(--gold-rgb) / 0.3)  */
```

Nhờ vậy hơn 30 sắc độ vàng khác nhau giờ chỉ phụ thuộc một token. Đây chính là
lớp mà nút chuyển theme sau này cần — chỉ việc thêm khối token thứ hai, **không
phải đụng vào bất kỳ quy tắc CSS nào**.

**Ba nhóm màu** — cần nhớ mỗi khi sửa màu về sau:

| Nhóm | Xử lý |
|---|---|
| Đảo theo theme | nền, chữ, viền, màu nhấn — phần lớn |
| **Không đảo** | `--veil-rgb`, `--on-photo`, `--sheen-rgb`: chữ và lớp phủ nằm **trên ảnh chụp**. Ảnh vẫn là ảnh dù trang sáng hay tối |
| Xử lý riêng | hero (phủ kem mỏng + chữ tối) và lightbox (giữ nền tối ở cả hai theme) |

**Dùng chung, không nhân bản:** `../js/*`, `../images/*`, `../fonts/*`. Thư mục
chỉ nặng **340 KB**, trong đó 175 KB là ảnh bản đồ bản sáng (dựng lại từ chính
bộ tile OSM đã tải, đổi sang tông sáng).

**Hero** qua ba vòng chỉnh theo phản hồi: (1) chữ trắng trên ảnh phủ đen →
(2) chữ tối, ảnh phủ kem đậm → user báo ảnh mờ quá → (3) ảnh rõ hơn nhưng lớp
phủ tụ vào giữa → user báo có mảng sáng sau chữ → **(4) lớp phủ trải đều 0.62,
chữ trong hero dùng màu đậm riêng**. Đo bằng cách đọc pixel trên ảnh chụp
thật, lấy điểm nền tối nhất trong vùng chữ: tiêu đề 6.79:1 · dòng dẫn 4.74:1 ·
dòng nhấn 4.6:1 · badge 5.93:1.

**Kiểm bản sáng** ở 1920 / 1366 / 768 / 375:

| Tiêu chí | Kết quả |
|---|---|
| Scroll ngang thừa | 0 px ở cả 4 mốc |
| Phần tử tràn khung | 0 |
| Ảnh hỏng / request lỗi | 0 |
| Lỗi JS | 0 |
| **Chữ dưới ngưỡng AA 4.5:1** | **0** — phải chỉnh `--gold`, `--on-muted` và ba màu trạng thái mới đạt |

Lật sách, lightbox, chip liên hệ, hai form, menu mobile, nút sao chép: đều chạy.
Bản tối cũng được chạy lại toàn bộ để chắc không hồi quy — kết quả giữ nguyên.

Thư mục này chỉ là bước trung gian để xem thử tông sáng trước khi quyết. Sau
khi nối xong nút chuyển (mục K) thì toàn bộ đã được gộp vào bản chính và thư
mục đã bị xoá — site giờ chỉ còn **một phiên bản HTML duy nhất**.

---

## K. Nút chuyển Dark ⇄ Light — trên bản chính, một phiên bản duy nhất

Yêu cầu: mặc định tối, bấm đổi sang sáng, **cùng một giao diện — không đổi
URL**, hiệu ứng chuyển đẹp và mượt, và **chỉ giữ một phiên bản HTML**.

### Cách chuyển

Toàn bộ việc đổi màu gói trong **một thao tác**: bật/tắt `data-theme="light"`
trên thẻ `<html>`. Được vậy là nhờ bước token-hoá ở mục J — hai bảng màu nằm
cạnh nhau trong `css/main.css` (`:root` = tối, `:root[data-theme="light"]` =
sáng), **không nhân đôi một dòng quy tắc CSS nào**.

### Hiệu ứng

| Đường | Khi nào | Làm gì |
|---|---|---|
| **View Transitions** | Chrome, Edge, Safari 18+ | Trình duyệt chụp ảnh trước/sau, `theme.js` cho **một hình tròn loang ra từ đúng chỗ vừa bấm** tới khi phủ hết màn hình — 620ms, `cubic-bezier(.16,1,.3,1)`, bán kính bằng khoảng cách tới góc xa nhất |
| **Dự phòng** | Firefox | Class `.theme-anim` bật CSS transition cho màu/viền/bóng ~450ms rồi **tự gỡ**, nên trang không gánh transition thường trực |

Thêm: mặt trời ⇄ mặt trăng đổi chỗ bằng xoay + thu phóng, tia nắng xoè ra chậm
hơn thân một nhịp, và một vòng sáng nở ra quanh nút mỗi lần bấm. Bật *giảm
chuyển động* thì đổi ngay, không animation.

### Ba chỗ không thể xử lý bằng CSS

1. **Ảnh bản đồ** — hai file dark/light, `theme.js` đổi `src`; ảnh của theme
   còn lại được **nạp sẵn** sau `load` nên bấm lần đầu không phải chờ.
2. **Màu trong SVG logo/avatar** — thuộc tính `fill="..."` **không đọc được**
   biến CSS, đã đổi 21 chỗ sang `style="fill:var(--gold)"` để tự theo theme.
3. **`<meta name="theme-color">`** — cập nhật theo theme.

### Chống nháy màu khi tải trang

Một script nhỏ chạy **đồng bộ trong `<head>`**, đọc `localStorage` rồi đặt
`data-theme` **trước khung vẽ đầu tiên**. Nếu để ở cuối `<body>` thì người dùng
đã chọn sáng sẽ thấy trang loé tối một nhịp rồi mới nhảy sang sáng.

### Kiểm chứng

**Chế độ tối có đúng bằng bản chính không** — so pixel ở 1440px:

| Section | Giống |
|---|---|
| hero · menu · gallery · story · testimonials · contact · footer | **100.00%** |
| header | 98.87% — đúng bằng vùng nút chuyển mới thêm |

Trong lúc so đã bắt được **hai quy tắc bị lệch** do đợt làm bản sáng để lại:
`.hero__cta--outline` bị nâng viền 0.3 → 0.55 và `.tcard__tag` bị đổi nền — cả
hai là quy tắc **nền chung** nên đã làm hỏng luôn theme tối. Đã trả về giá trị
gốc và chuyển phần chỉnh vào khối riêng của theme sáng; sau đó 7/8 section về
đúng 100.00%.

**Cả hai theme ở 1920 / 1366 / 768 / 375:** 0 scroll ngang · 0 tràn khung ·
0 ảnh hỏng · 0 lỗi JS · 0 chữ dưới ngưỡng AA.

> Máy đo báo 4 tiêu đề ở theme tối, nhưng là **báo nhầm**: chúng dùng
> `background-clip: text` nên `color` tính ra `transparent`, không đo được bằng
> cách thông thường. Bốn tiêu đề đó giống hệt bản chính (đã xác nhận bằng
> pixel-diff 100%).

**Thao tác thật, chạy ở cả hai theme:** lật sách · lightbox · hai form · ngăn
kéo mobile · nút sao chép · bấm nút ở header · bấm công tắc trong ngăn kéo ·
nhớ lựa chọn sau khi tải lại · đổi ảnh bản đồ theo theme. Không lỗi nào.

### Gộp `html-light/` vào bản chính rồi xoá

Nguyên tắc khi gộp: **không viết lại gì**, chỉ bê nguyên xi file rồi trả lại
đường dẫn — vì viết lại là có nguy cơ đổi giao diện hoặc đổi cảm giác chuyển.

| File | Thao tác |
|---|---|
| `css/home.css` | copy nguyên |
| `css/main.css` | copy nguyên, trả 10 đường dẫn font `../../fonts/` → `../fonts/` |
| `js/theme.js` | copy nguyên |
| `index.html` | copy nguyên, trả 26 đường dẫn `../images/` `../js/` về gốc |
| `images/map-danang-light.jpg` | copy vào; bản tối giữ tên cũ `map-danang.jpg` |

**Chứng minh không lệch — so pixel bản chính mới với `html-light/`:**

| Chế độ | header | hero | menu | gallery | story | testimonials | contact | footer |
|---|---|---|---|---|---|---|---|---|
| Tối | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| Sáng | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |

**16/16 ô đúng 100.00%.** Khung chụp giữa lúc loang cũng trùng khít — hiệu ứng
chuyển giữ nguyên, không phải dựng lại.

Chạy lại đầy đủ trên bản chính: nút chuyển (mặc định tối → sáng → tối, nhớ lựa
chọn sau khi tải lại, đổi ảnh bản đồ, đổi `meta[theme-color]`), tương tác ở cả
hai chế độ (lật sách, lightbox, form, ngăn kéo mobile, công tắc trong ngăn
kéo), và soát bố cục ở 1920/1366/768/375 — **0 lỗi JS, 0 scroll ngang,
0 ảnh hỏng**.

Sau đó `html-light/` đã bị xoá. Cấu trúc cuối cùng:

```
albi-coffe-netlify-app-clone/
├── index.html          một bản duy nhất, có sẵn nút chuyển Dark ⇄ Light
├── css/  main.css      hai bảng màu :root và :root[data-theme="light"]
│      home.css         + khối ghi đè riêng cho theme sáng ở cuối file
├── js/   theme.js      bật/tắt data-theme + hiệu ứng loang tròn
│         main.js  forms.js  gallery.js  flipbook.js
├── images/             + map-danang.jpg (tối) và map-danang-light.jpg (sáng)
├── fonts/
└── reports/
```

### Dọn nốt: ba màu chữ hero thành token

Sau khi gộp còn sót `#3f3931`, `#59300a`, `#7a400c` ghi thẳng trong `home.css`
— là màu chữ hero ở theme sáng, chỉnh riêng theo số đo tương phản trên ảnh.
Đã đưa vào bảng token thành `--hero-ink`, `--hero-accent`,
`--hero-accent-soft`. So pixel lại **16/16 ô = 100.00%**, nghĩa là chỉ đổi cách
viết, không đổi hiển thị.

Giờ **không còn một mã màu nào nằm ngoài hai khối `:root`** trong cả hai file
CSS. Muốn đổi tông toàn site chỉ cần sửa ở một chỗ.
