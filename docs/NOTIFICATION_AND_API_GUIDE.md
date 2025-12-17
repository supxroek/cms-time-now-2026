# ระบบ Notification และ API Service

## 📋 สรุปการปรับปรุง

### 1. Centralized Notification System

ระบบแจ้งเตือนแบบศูนย์กลางที่จัดการผ่าน Redux

### 2. API Service Layer

ระบบจัดการ API ที่มีประสิทธิภาพพร้อมฟีเจอร์:

- **Request Caching**: ลดการเรียก API ซ้ำ
- **Request Deduplication**: ป้องกันการเรียก API ซ้ำพร้อมกัน
- **Retry Logic**: ลองใหม่อัตโนมัติเมื่อเกิดข้อผิดพลาด
- **Error Parsing**: แปลง error เป็นข้อความภาษาไทยที่เข้าใจง่าย

### 3. UX Components

- **Toast**: แจ้งเตือนแบบ popup
- **Loading States**: Spinner และ Skeleton loading
- **Error Boundary**: จัดการ error ไม่ให้ crash ทั้งหน้า
- **Empty State**: แสดงเมื่อไม่มีข้อมูล
- **Connection Status**: แสดงสถานะการเชื่อมต่อ
- **Confirm Dialog**: ยืนยันการกระทำ

---

## 🚀 วิธีใช้งาน

### 1. แสดง Notification

```jsx
import { useNotification } from "../hooks/useNotification";

function MyComponent() {
  const { success, error, warning, info, withAction } = useNotification();

  // แสดง notification ง่ายๆ
  const handleSave = () => {
    success("บันทึกสำเร็จ", "ข้อมูลถูกบันทึกเรียบร้อยแล้ว");
  };

  // แสดง error
  const handleError = () => {
    error("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
  };

  // แสดงพร้อม action button
  const handleWithAction = () => {
    withAction(
      "info",
      "มีข้อมูลใหม่",
      "ต้องการโหลดข้อมูลใหม่หรือไม่?",
      "โหลดใหม่",
      () => window.location.reload()
    );
  };

  return <button onClick={handleSave}>บันทึก</button>;
}
```

### 2. ใช้ API Service

```jsx
import { useApi } from "../hooks/useApi";
import { API_ENDPOINTS } from "../config/constants";

function EmployeeList() {
  const {
    data: employees,
    isLoading,
    error,
    refresh,
  } = useApi(API_ENDPOINTS.COMPANY.EMPLOYEES, {
    immediate: true, // เรียก API ทันทีเมื่อ mount
    cache: true, // ใช้ cache
    showNotification: true, // แสดง notification เมื่อ error
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorState onRetry={refresh} />;
  if (!employees?.length) return <EmptyState />;

  return (
    <ul>
      {employees.map((emp) => (
        <li key={emp.id}>{emp.name}</li>
      ))}
    </ul>
  );
}
```

### 3. ใช้ Confirm Dialog

```jsx
import { useConfirm } from "../hooks/useConfirm";

function DeleteButton({ onDelete }) {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "ยืนยันการลบ",
      message: "คุณต้องการลบข้อมูลนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
      variant: "danger",
    });

    if (confirmed) {
      onDelete();
    }
  };

  return (
    <Button variant="danger" onClick={handleDelete}>
      ลบ
    </Button>
  );
}
```

### 4. ใช้ Loading Components

```jsx
import { Spinner, LoadingCard, SkeletonList, SkeletonTable } from '../components/atoms/Loading';

// Spinner ขนาดต่างๆ
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Loading Card สำหรับพื้นที่เฉพาะ
<LoadingCard message="กำลังโหลดข้อมูล..." />

// Skeleton สำหรับ list
<SkeletonList rows={5} />

// Skeleton สำหรับ table
<SkeletonTable rows={10} columns={4} />
```

### 5. ใช้ Error Boundary

```jsx
import { ErrorBoundary } from "../components/molecules/ErrorBoundary";

// ครอบ component ที่อาจเกิด error
<ErrorBoundary
  message="ไม่สามารถแสดงข้อมูลพนักงานได้"
  onError={(error) => console.error(error)}
>
  <EmployeeTable />
</ErrorBoundary>;
```

### 6. API Service โดยตรง

```jsx
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  parseApiError,
} from "../services/api";

// GET พร้อม cache
const employees = await apiGet("/company/employees", {
  cache: true,
  cacheTTL: 5 * 60 * 1000, // 5 นาที
});

// POST
const newEmployee = await apiPost("/company/employees", {
  name: "John Doe",
  email: "john@example.com",
});

// จัดการ error
try {
  await apiDelete(`/company/employees/${id}`);
} catch (err) {
  const errorInfo = parseApiError(err);
  console.log(errorInfo.title, errorInfo.message);
}
```

---

## 📁 โครงสร้างไฟล์ที่เพิ่มใหม่

src/
├── services/
│   └── api.js                    # API Service Layer
├── store/slices/
│   └── notificationSlice.js      # Notification Redux Slice
├── contexts/
│   └── ConfirmContext.js         # Confirm Dialog Context
├── hooks/
│   ├── useApi.js                 # API Hook
│   ├── useNotification.js        # Notification Hook
│   ├── useConfirm.js             # Confirm Dialog Hook
│   └── useOnlineStatus.js        # Online Status Hook
├── components/
│   ├── atoms/
│   │   ├── Toast.jsx             # Toast Component
│   │   ├── Loading.jsx           # Loading Components
│   │   └── EmptyState.jsx        # Empty State Component
│   └── molecules/
│       ├── ErrorBoundary.jsx     # Error Boundary
│       ├── ConnectionStatus.jsx  # Connection Status
│       └── ConfirmDialog.jsx     # Confirm Dialog

---

## ⚡ ประสิทธิภาพที่ได้รับ

1. **ลดการเรียก API ซ้ำ** - ด้วย caching และ deduplication
2. **ป้องกัน race condition** - ด้วย request deduplication
3. **Error handling ที่ดีขึ้น** - ด้วย retry logic และ error parsing
4. **UX ที่ดีขึ้น** - ด้วย loading states และ notifications
5. **Accessibility** - รองรับ reduced motion และ screen readers
