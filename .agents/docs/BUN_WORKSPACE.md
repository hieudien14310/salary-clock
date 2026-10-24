# Hướng dẫn sử dụng Bun Workspace & Catalogs

Tài liệu này hướng dẫn cách tổ chức cấu trúc Monorepo, quản lý dependency dùng chung thông qua Bun Catalogs và các câu lệnh CLI cần thiết để phát triển dự án **Nhiệm vụ hệ thống**. 

Được biên soạn để lập trình viên mới hoặc các **AI Coding Agents** có thể đọc, hiểu và tuân thủ nhanh chóng.

---

## 📁 1. Cấu trúc Monorepo

Dự án được tổ chức dưới dạng Monorepo sử dụng tính năng **Bun Workspaces**:

```txt
<root>
├── package.json         # Cấu hình workspace và catalog tập trung
├── bun.lock             # Lockfile chung duy nhất cho toàn monorepo
├── apps/                # Chứa các ứng dụng độc lập
│   ├── backend/         # API tRPC Server
│   ├── backoffice/      # Trang Admin (React + Vite)
│   ├── jobs/            # Background jobs xử lý định kỳ
│   └── mobile/          # Ứng dụng di động (Expo)
└── packages/            # Chứa các gói/thư viện dùng chung cục bộ
    └── database/        # Package quản lý kết nối DB và Drizzle Schema
```

---

## 📦 2. Cơ chế Quản lý Dependency (Bun Catalogs)

Để tránh việc mỗi gói con tự định nghĩa các phiên bản thư viện khác nhau gây xung đột, dự án sử dụng **Bun Catalogs** để quản lý phiên bản tập trung tại root `package.json`.

### Cách khai báo:
1. **Tại thư mục gốc (`/package.json`)**: Định nghĩa danh sách các thư viện dùng chung trong trường `workspaces.catalog`:
   ```json
   {
     "workspaces": {
       "packages": ["apps/*", "packages/*"],
       "catalog": {
         "zod": "^4.4.3",
         "dayjs": "^1.11.21",
         "drizzle-orm": "^0.45.2"
       }
     }
   }
   ```

2. **Tại gói con (ví dụ `apps/backend/package.json`)**: Sử dụng giao thức `catalog:` để tham chiếu đến phiên bản ở root thay vì viết cứng số phiên bản:
   ```json
   {
     "dependencies": {
       "zod": "catalog:",
       "dayjs": "catalog:",
       "drizzle-orm": "catalog:"
     }
   }
   ```

> [!TIP]
> Khi muốn cập nhật phiên bản của một thư viện dùng chung (ví dụ nâng `zod` lên bản mới hơn), bạn **chỉ cần sửa số phiên bản tại file root `package.json`** và chạy lệnh `bun install`. Tất cả các gói con dùng `catalog:` sẽ tự động được cập nhật.

---

## 🔗 3. Liên kết Package Nội bộ (Workspace Dependencies)

Các gói nằm trong thư mục `packages/` (ví dụ: `database`) có thể được cài đặt làm dependency của các gói con khác mà không cần publish lên npm registry.

### Khai báo trong `package.json` của ứng dụng cần dùng:
Sử dụng giao thức `workspace:*`:
```json
{
  "dependencies": {
    "database": "workspace:*"
  }
}
```

### Sử dụng trong Code:
Sau khi khai báo, bạn có thể import trực tiếp như một thư viện thông thường từ bất kỳ file nào trong ứng dụng mà không cần sử dụng relative path (`../../..`):
```typescript
// Đúng (Sạch sẽ, dễ bảo trì):
import { db, UsersTable } from 'database';

// Sai (Tránh relative import sâu sang package khác):
import { db } from '../../../../packages/database';
```

---

## 💻 4. Các câu lệnh CLI cần thiết (Cheat Sheet)

Luôn đứng ở thư mục gốc (root) của dự án để chạy các lệnh này.

### 4.1. Cài đặt dependency chung
Cài đặt tất cả các dependencies cho toàn bộ các workspace trong monorepo:
```bash
bun install
```

### 4.2. Cài đặt thư viện mới cho một package con cụ thể
Sử dụng cờ `--filter` (hoặc viết tắt là `-F`) đi kèm với tên gói con (là trường `name` trong `package.json` của gói đó):

* **Cài đặt thư viện production:**
  ```bash
  bun --filter backend add lodash
  # hoặc
  bun -F backend add lodash
  ```

* **Cài đặt thư viện phát triển (devDependencies):**
  ```bash
  bun -F backoffice add -d @types/lodash
  ```

* **Sử dụng cờ `--cwd` thay thế:**
  ```bash
  bun add --cwd apps/backend lodash
  ```

### 4.3. Chạy script của package con từ thư mục gốc
Bạn không cần `cd` vào thư mục của gói con để chạy lệnh:

* **Chạy script thông thường (Ví dụ script `dev` của backend):**
  ```bash
  bun -F backend dev
  ```

* **Chạy lệnh expo start cho mobile:**
  ```bash
  bun -F mobile start
  ```

### 4.4. Chạy script hàng loạt trên các Workspace
* **Chạy song song (Parallel) script `typecheck` trên tất cả các gói con:**
  ```bash
  bun --workspaces typecheck
  ```

* **Chạy lần lượt/tuần tự (Sequential) script `typecheck`:**
  ```bash
  bun --workspaces --sequential typecheck
  ```

* **Chạy script trên một nhóm gói khớp pattern:**
  ```bash
  bun --filter "apps/*" build
  ```

---

## ⚠️ 5. Lưu ý quan trọng cho AI Coding Agent & Lập trình viên
1. **Không tạo lockfile cục bộ**: Tuyệt đối không tạo file `bun.lock` bên trong các thư mục con như `apps/backend/bun.lock`. Tất cả các thư viện cài đặt phải được ghi nhận vào file `bun.lock` duy nhất ở thư mục gốc.
2. **Luôn sử dụng catalog**: Khi cài đặt một thư viện mới mà thư viện đó cũng được dùng ở gói khác, hãy thêm nó vào `catalog` ở root trước, sau đó khai báo `catalog:` ở gói con.
3. **Chạy typecheck trước khi commit**: Luôn chạy lệnh kiểm tra toàn cục `bun run all-tc` từ thư mục gốc trước khi tạo commit hoặc đẩy code lên git để đảm bảo tính an toàn kiểu dữ liệu trên toàn bộ monorepo.
