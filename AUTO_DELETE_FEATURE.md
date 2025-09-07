
```typescript
// Chạy mỗi 60 giây
const interval = setInterval(handleAutoDelete, 60000);

// Lọc disruptions hết hạn khi fetch data
const activeDisruptions = filterActiveDisruptions(processedDisruptions);
setDisruptions(activeDisruptions);

const handleAutoDelete = async () => {
  const deletedIds = await autoDeleteExpiredDisruptions(disruptions);
  if (deletedIds.length > 0) {
    await fetchDisruptions(); // Refresh list
  }
};

const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

// Test với thời gian giả
const testTime = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 giờ trước
const isExpired = isDisruptionExpired(testTime.toISOString());
console.log(isExpired); // true
