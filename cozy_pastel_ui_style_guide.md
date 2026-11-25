# 🎨 UI/UX Style Guide: Cozy Pastel & Stationery Aesthetic

> **Phong cách chủ đạo:** Cozy Flat UI kết hợp 2D Hand-drawn Chibi (Phong cách Quản lý Ấm cúng / Sổ tay Pastel).  
> **Ứng dụng phù hợp:** Game Casual Simulation, Tycoon, Quản lý cửa hàng, Ứng dụng theo dõi thói quen / tài chính cá nhân thân thiện.

---

## 1. Nguyên tắc thiết kế cốt lõi (Core Design Principles)

1. **Cảm giác Sổ tay & Thẻ giấy (Stationery Aesthetic):**  
   Giao diện mô phỏng một trang sổ kế toán hoặc bảng ghi chú bằng giấy ấm áp. Hạn chế tối đa đổ bóng 3D dày (`box-shadow`) hay hiệu ứng kính mờ; thay vào đó sử dụng **nền màu phẳng kết hợp viền mảnh (thin stroke `1.5px` – `2px`)**.
2. **Tuyệt đối không dùng Trắng tinh (`#FFFFFF`) và Đen tuyền (`#000000`):**  
   Sử dụng nền màu kem ngà (`#FFFDF7`) và chữ màu nâu cà phê trầm (`#4E3835`) để giảm độ tương phản gắt, giúp người dùng đọc các bảng số liệu dài mà không bị mỏi mắt.
3. **Hình học bo tròn mềm mại (Soft Rounded Geometry):**  
   Triệt tiêu hoàn toàn các góc nhọn. Mọi khung chứa, thẻ nút và thanh trượt đều sử dụng độ bo góc lớn (`12px` – `24px`) hoặc dạng viên thuốc (`9999px`) để tạo cảm giác thân thiện, thư giãn.
4. **Phân cấp thông tin bằng màu Pastel dịu (Soft Semantic Color Coding):**  
   Các nhóm chức năng được phân loại bằng các mảng màu pastel nhẹ nhàng (kem bơ, xanh phấn, xanh bạc hà) thay vì dùng màu bão hòa cao.

---

## 2. Hệ thống màu sắc (Color System)

### 2.1. Bảng màu chi tiết (Color Tokens)

| Token Name | Tên màu | Mã HEX | Vai trò & Quy tắc sử dụng |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | **Warm Ivory** (Kem sữa ấm) | `#FFFDF7` | Nền chính của Modal, thẻ nội dung và bảng thống kê. |
| `--bg-surface` | **Cream Paper** (Giấy kem) | `#FCF8F0` | Nền phụ cho các vùng chứa lớn hoặc khu vực phân tách. |
| `--btn-default` | **Butter Cream** (Kem bơ) | `#F6EBD2` | Nền nút bấm mặc định, tab đang chọn (như tab *Thống kê*, *Ngày*). |
| `--btn-blue` | **Baby Blue** (Xanh phấn) | `#E2F0F9` | Nền nhóm nút chức năng phụ (như *Kệ hàng*, *Đánh giá*, *Mục tiêu*). |
| `--btn-mint` | **Soft Mint** (Xanh bạc hà nhạt) | `#E4F2D8` | Nền nhóm nút tăng trưởng (như *Nâng cấp*, *Chi nhánh*). |
| `--btn-active-green`| **Sage Green** (Xanh lá mạ) | `#95C9A8` | Nền nút đang được kích hoạt nổi bật (Active State). |
| `--text-heading` | **Deep Burgundy** (Đỏ rượu trầm) | `#6E2C3B` | Tiêu đề lớn của màn hình / Modal (tạo điểm nhấn cổ điển). |
| `--text-primary` | **Dark Espresso** (Nâu cà phê) | `#4E3835` | Màu chữ nội dung chính, nhãn nút và số liệu chi phí (số âm). |
| `--text-muted` | **Warm Taupe** (Nâu xám ấm) | `#8C7670` | Chữ mô tả phụ, ghi chú thời gian, trạng thái không hoạt động. |
| `--semantic-positive`| **Muted Forest** (Xanh cổ vịt dịu)| `#357A5B` | Số liệu tích cực: Lãi ròng, Doanh thu, Tiền thưởng (`+`). |
| `--semantic-negative`| **Muted Rust** (Đỏ gạch trầm) | `#7A3B3B` | Số liệu chi phí, tổn thất, trừ tiền (`-`) mà không gây cảm giác "báo động". |
| `--accent-gold` | **Warm Ochre** (Vàng kim ấm) | `#E0A938` | Hiển thị số dư tiền tệ chính (`$`), cấp độ, phần thưởng. |
| `--accent-coral` | **Coral Berry** (Hồng san hô) | `#E35D75` | Điểm nhấn tương tác: Nút kéo Slider, icon đặc biệt, thanh cuộn. |
| `--border-warm` | **Sand Border** (Viền cát vàng) | `#DFC896` | Viền chính bao quanh Modal và các nút tông kem. |
| `--border-brown` | **Cocoa Stroke** (Viền nâu mảnh) | `#7D635B` | Viền cho các nút bấm tương tác chính và khung bảng dữ liệu. |

---

### 2.2. Biến CSS sẵn dùng (`variables.css`)

```css
:root {
  /* Backgrounds */
  --bg-canvas: #FFFDF7;
  --bg-surface: #FCF8F0;
  --bg-overlay: rgba(78, 56, 53, 0.45);

  /* Button & Card Fills */
  --fill-cream: #F6EBD2;
  --fill-cream-hover: #EFE0BE;
  --fill-blue: #E2F0F9;
  --fill-mint: #E4F2D8;
  --fill-sage-active: #95C9A8;

  /* Typography Colors */
  --text-heading: #6E2C3B;
  --text-primary: #4E3835;
  --text-muted: #8C7670;

  /* Semantic & Accent Colors */
  --color-positive: #357A5B;
  --color-negative: #6B3E3B;
  --color-gold: #E0A938;
  --color-coral: #E35D75;

  /* Borders */
  --border-modal: #DFC896;
  --border-control: #7D635B;
  --border-table: #668C77;

  /* Radii & Strokes */
  --radius-modal: 24px;
  --radius-card: 14px;
  --radius-button: 12px;
  --radius-pill: 9999px;
  --stroke-thin: 1.5px;
  --stroke-thick: 2.5px;
}
```

### 2.3. Cấu hình mở rộng cho Tailwind CSS (`tailwind.config.js`)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        cozy: {
          canvas: '#FFFDF7',
          surface: '#FCF8F0',
          cream: '#F6EBD2',
          blue: '#E2F0F9',
          mint: '#E4F2D8',
          sage: '#95C9A8',
          burgundy: '#6E2C3B',
          espresso: '#4E3835',
          taupe: '#8C7670',
          forest: '#357A5B',
          gold: '#E0A938',
          coral: '#E35D75',
          borderSand: '#DFC896',
          borderCocoa: '#7D635B',
        }
      },
      borderRadius: {
        'cozy-modal': '24px',
        'cozy-card': '14px',
        'cozy-btn': '12px',
      },
      fontFamily: {
        cozy: ['"Baloo 2"', '"Quicksand"', '"Nunito"', 'sans-serif'],
      }
    }
  }
}
```

---

## 3. Hệ thống chữ (Typography)

* **Đặc điểm font:** Sử dụng kiểu chữ **Rounded Sans-Serif** (không chân, đầu nét bo tròn) có hỗ trợ tốt dấu tiếng Việt để tạo sự thân thiện, dễ đọc cho cả chữ in hoa lẫn số liệu.
* **Đề xuất Google Fonts (Hỗ trợ tiếng Việt):**
  * **Tiêu đề & Nhãn nút:** `Baloo 2` (Weight: `700`, `800`) hoặc `Mali` (`700`).
  * **Nội dung & Bảng số liệu:** `Quicksand` (Weight: `600`, `700`) hoặc `Nunito` (`600`, `700`).
* **Quy tắc căn chỉnh số liệu:**
  * Các con số tiền tệ và thống kê nên bật thuộc tính `font-variant-numeric: tabular-nums;` để các hàng số thẳng cột khi căn phải.

---

## 4. Hình khối & Quy chuẩn thành phần (Components)

* **Modal Container:** Nền `#FFFDF7`, viền ngoài dày `3px solid #DFC896`, bo góc `24px`.
* **Grid Action Buttons (Nút chức năng có Icon):**
  * Nền pastel theo nhóm (`#F6EBD2`, `#E2F0F9`, `#E4F2D8`), viền mảnh `1.5px solid #9E8C7A`, bo góc `12px`.
  * Nhãn chữ bên dưới icon viết `UPPERCASE`, cỡ chữ nhỏ (`11px` – `12px`), đậm (`700`), màu `#4E3835`.
* **Pill Tabs (Bộ lọc thời gian / Danh mục):**
  * Bo tròn tối đa (`border-radius: 9999px`), viền `1.5px solid #7D635B`.
  * Trạng thái chọn: Nền `#F6EBD2`. Trạng thái mặc định: Nền `#FFFDF7`.
* **Data Table Box (Khung thống kê):**
  * Nền `#FFFDF7`, viền mảnh `1.5px solid #668C77` (xanh lá trầm), bo góc `14px`.
  * Khoảng cách dòng thoáng (`line-height: 1.6`), nhãn bên trái màu `#4E3835`, giá trị căn phải tô màu theo ý nghĩa (`#357A5B` cho số dương, `#6B3E3B` cho số âm).

---

## 5. Quy chuẩn minh họa & Icon (2D Asset Guidelines)

* **Phong cách:** 2D Kawaii / Doodle Hand-drawn.
* **Nét viền (Line art):** Tuyệt đối không dùng nét đen (`#000000`). Toàn bộ icon sử dụng nét viền màu **nâu đậm (`#4E3835` hoặc `#5C3A32`)** với độ dày đồng nhất.
* **Đổ bóng (Shading):** Tô màu phẳng (flat base color) kết hợp tối đa 1 lớp bóng đổ mềm (cel-shading) và 1 điểm bắt sáng trắng nhẹ để giữ độ tối giản.

---

## 6. AI Prompts mẫu (Tái tạo Asset & Giao diện)

### Prompt sinh Icon 2D đồng bộ (Midjourney / DALL-E / Stable Diffusion)
> `2D cute chibi game icon of [TÊN VẬT PHẨM, vd: a pink cash register], kawaii hand-drawn doodle style, warm dark brown outlines, soft pastel color palette, minimal cel-shading, cozy shop management simulation asset, centered, isolated on a solid warm cream background #FFFDF7, flat vector aesthetic --no realistic 3d, black outline, harsh shadow`

### Prompt sinh UI Component cho AI Coding (Cursor / Claude / v0)
> `Build a UI screen using a "Cozy Pastel Stationery" aesthetic. Use warm ivory (#FFFDF7) for the main background instead of pure white, and dark espresso brown (#4E3835) for text instead of black. Use soft pastel fills (#F6EBD2, #E2F0F9, #E4F2D8) with thin 1.5px warm borders (#7D635B), large rounded corners (14px-24px), pill-shaped filter tabs, and rounded friendly typography (Quicksand/Baloo 2). Avoid heavy drop shadows; keep the layout flat, clean, and soothing.`