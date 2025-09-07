
```typescript
if (!processedReports.has(report) && !pingedReports.has(report)) {
  const timestamp = parseInt(parts[parts.length - 1]);
  if (isReportRecent(timestamp)) {
    showInspectorMarker(location);
    setProcessedReports(prev => new Set([...prev, report]));
    setPingedReports(prev => new Set([...prev, report]));
  }
}

useEffect(() => {
  try {
    const stored = localStorage.getItem('pingedInspectorReports');
    if (stored) {
      const pingedReportsArray = JSON.parse(stored);
      setPingedReports(new Set(pingedReportsArray));
    }
  } catch (error) {
    console.error('Error loading pinged reports:', error);
  }
}, []);
```
```typescript
useEffect(() => {
  try {
    localStorage.setItem('pingedInspectorReports', JSON.stringify(Array.from(pingedReports)));
  } catch (error) {
    console.error('Error saving pinged reports:', error);
  }
}, [pingedReports]);
```

```typescript
const checkForInspectorReports = () => {
  const stored = localStorage.getItem('inspectorReports');
  if (stored) {
    const inspectorReports = JSON.parse(stored);
    
    inspectorReports.forEach((report: string) => {
      if (!processedReports.has(report) && !pingedReports.has(report)) {
        const parts = report.split('-');
        if (parts.length >= 3) {
          const timestamp = parseInt(parts[parts.length - 1]);
          if (isReportRecent(timestamp)) {
            // Ping marker và lưu vào cả 2 sets
            showInspectorMarker(location);
            setProcessedReports(prev => new Set([...prev, report]));
            setPingedReports(prev => new Set([...prev, report]));
          }
        }
      }
    });
  }
};
```
```typescript
// Kiểm tra report có trong vòng 2 phút không
const isReportRecent = (timestamp: number): boolean => {
  const now = Date.now();
  const twoMinutesAgo = now - (2 * 60 * 1000);
  return timestamp >= twoMinutesAgo;
};

// Lấy chuỗi thời gian cho logging
const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffInSeconds = Math.round((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else {
    const diffInMinutes = Math.round(diffInSeconds / 60);
    return `${diffInMinutes}m ago`;
  }
};
```

## Data Structure

### Inspector Reports Format
```
"route-location-timestamp"
Ví dụ: "123-Melbourne Central-1703123456789"
```

### Pinged Reports Storage
```json
[
  "123-Melbourne Central-1703123456789",
  "456-Southern Cross-1703123456790"
]
```

## Features

### ✅ Có gì
- **Ping 1 lần duy nhất**: Mỗi post chỉ ping 1 lần
- **Persistent storage**: Lưu trong localStorage
- **Session + Persistent tracking**: Kết hợp cả 2 loại tracking
- **Debug function**: Clear pinged reports (development mode)
- **Error handling**: Xử lý lỗi localStorage

### ❌ Không có gì
- **Không ping lặp lại**: Tránh spam ping
- **Không mất data**: Dữ liệu được lưu persistent
- **Không ảnh hưởng performance**: Chỉ check mỗi 2 giây

## Debug Features

### Clear Pinged Reports
```typescript
const clearPingedReports = () => {
  setPingedReports(new Set());
  localStorage.removeItem('pingedInspectorReports');
  console.log('Pinged reports cleared');
};
```

### Debug Button (Development Mode)
- Chỉ hiển thị trong development mode
- Vị trí: Bottom-right corner
- Chức năng: Clear tất cả pinged reports

## User Experience

### Đối với người dùng
1. **Tạo inspector report**: Ping ngay lập tức
2. **Refresh trang**: Không ping lại report cũ
3. **Mở tab mới**: Không ping lại report đã ping
4. **Restart browser**: Không ping lại report đã ping

### Đối với developer
1. **Console logs**: Thấy được reports đã ping
2. **localStorage**: Có thể inspect data
3. **Debug button**: Reset khi cần test

## Testing

### Manual Testing
1. Tạo inspector report mới
2. Kiểm tra ping xuất hiện trên map
3. Refresh trang → không ping lại
4. Mở tab mới → không ping lại
5. Sử dụng debug button → reset và ping lại

### Code Testing
```typescript
// Test pinged reports state
console.log('Pinged reports:', Array.from(pingedReports));

// Test localStorage
console.log('Stored pinged reports:', localStorage.getItem('pingedInspectorReports'));

// Test clear function
clearPingedReports();
```

## Performance

### Tối ưu
- **Set data structure**: O(1) lookup time
- **localStorage sync**: Chỉ save khi có thay đổi
- **Interval cleanup**: Clear interval khi unmount

### Resource Usage
- **Memory**: Minimal (chỉ lưu report keys)
- **Storage**: ~1KB cho 100 reports
- **CPU**: Minimal (chỉ check mỗi 2 giây)

## Troubleshooting

### Reports vẫn ping lặp lại
1. Kiểm tra localStorage có data không
2. Kiểm tra logic condition
3. Kiểm tra report key format
4. Sử dụng debug button để reset

### Performance issues
1. Kiểm tra số lượng reports
2. Kiểm tra localStorage size
3. Kiểm tra interval cleanup

### Data loss
1. Kiểm tra localStorage permissions
2. Kiểm tra browser storage limits
3. Kiểm tra error handling
