# Notification Feature - Mobile App

## Tanggal: 10 Februari 2026

### Overview

Fitur notifikasi telah diimplementasikan secara lengkap di mobile app dengan:
1. ✅ **Halaman Notifications** - Full screen untuk melihat semua notifikasi
2. ✅ **Dashboard Integration** - Tombol notifikasi di Dashboard mengarah ke halaman Notifications
3. ✅ **Badge Count** - Menampilkan jumlah notifikasi yang belum dibaca
4. ✅ **Filter & Actions** - Filter by status, mark all as read, clear read notifications

---

## Struktur Implementasi

### 1. **NotificationsScreen** (`/src/screens/NotificationsScreen.js`)

**Fitur Utama:**
- 📋 Menampilkan semua notifikasi dengan scroll
- 🔔 Badge count untuk notifikasi belum dibaca
- 🔍 Filter: Semua, Belum Dibaca, Sudah Dibaca
- ✅ Mark as read (tap pada notifikasi)
- ✅ Mark all as read (tombol Tandai Semua)
- 🗑️ Delete single notification (long press atau tombol delete)
- 🧹 Clear all read notifications (tombol Bersihkan)
- 🔄 Pull to refresh
- ← Back button untuk kembali ke Dashboard

**State Management:**
```javascript
const [loading, setLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [notifications, setNotifications] = useState([]);
const [filter, setFilter] = useState('all');
const [unreadCount, setUnreadCount] = useState(0);
```

**API Calls:**
- `notificationService.getNotifications(filter)` - Fetch notifications
- `notificationService.markAsRead(id)` - Mark single as read
- `notificationService.markAllAsRead()` - Mark all as read
- `notificationService.clearReadNotifications()` - Clear read notifications
- `notificationService.deleteNotification(id)` - Delete single notification

---

### 2. **Dashboard Integration** (`/src/screens/DashboardScreen.js`)

**Quick Action Button:**
```javascript
<TouchableOpacity
  style={styles.quickActionButton}
  onPress={() => navigation.navigate('Notifications')}
>
  <Text style={styles.quickActionText}>Notifications</Text>
  {unreadCount > 0 && (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{unreadCount}</Text>
    </View>
  )}
</TouchableOpacity>
```

**Notification Section:**
- Menampilkan 5 notifikasi terbaru
- Link "Lihat Semua" untuk navigasi ke NotificationsScreen
- Badge count di title

```javascript
<View style={styles.cardHeader}>
  <Text style={styles.cardTitle}>
    Notifikasi {unreadCount > 0 && `(${unreadCount})`}
  </Text>
  <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
    <Text style={styles.seeAllText}>Lihat Semua</Text>
  </TouchableOpacity>
</View>
```

---

### 3. **Navigation Setup** (`App.js`)

**Stack Navigator:**
```javascript
<Stack.Screen 
  name="Notifications" 
  component={NotificationsScreen}
  options={{ 
    headerShown: false,
    presentation: 'card'
  }}
/>
```

**Navigation Flow:**
```
Dashboard (Tab Navigator)
    ↓
    → Notifications Button / Quick Action
    ↓
Notifications Screen (Stack Navigator)
    ← Back Button
    ↓
Dashboard
```

---

## UI/UX Details

### Header
- **Background**: White (`#ffffff`)
- **Padding**: 20px, paddingTop 60px
- **Layout**: Flexbox row (back button, title, spacer)
- **Title**: 24px bold, dark color (`#1e293b`)
- **Badge**: Shows unread count in parentheses

### Filter Section
- **Dropdown Picker**: Semua / Belum Dibaca / Sudah Dibaca
- **Background**: Light gray (`#f8fafc`)
- **Border Bottom**: Divider line

### Action Buttons
- **Tandai Semua**: Teal button (`#4DB8B8`)
- **Bersihkan**: Red danger button (`#dc2626`)
- **Layout**: Side by side with gap

### Notification Items
- **Card Style**: White background, rounded corners
- **Unread**: Blue tint background (`#eff6ff`), left border teal (`#4DB8B8`)
- **Read**: White background
- **Layout**: 
  - Title (bold, 14px)
  - Message (gray, 13px, line height 18px)
  - Date (small gray, 11px)
  - Delete button (emoji)
  - Unread dot (8px circle, teal)

### Interactions
- **Tap**: Mark unread notification as read
- **Long Press**: Show delete confirmation
- **Delete Button**: Direct delete with confirmation
- **Pull Down**: Refresh notifications

---

## API Integration

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications?filter=all` | Get all notifications |
| GET | `/api/notifications?filter=unread` | Get unread only |
| GET | `/api/notifications?filter=read` | Get read only |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/mark-all-read` | Mark all as read |
| DELETE | `/api/notifications/clear-read` | Clear read notifications |
| DELETE | `/api/notifications/:id` | Delete single notification |

### Response Format
```json
{
  "message": "Notifications retrieved",
  "data": [
    {
      "id": 1,
      "title": "Leave Request Approved",
      "message": "Your leave request has been approved",
      "isRead": false,
      "createdAt": "2026-02-10T10:30:00Z"
    }
  ]
}
```

---

## Styling Theme

### Colors (Teal Theme)
```javascript
{
  primary: '#4DB8B8',          // Teal (main accent)
  danger: '#dc2626',           // Red (delete actions)
  background: '#f8fafc',       // Light gray (page background)
  cardBackground: '#ffffff',   // White (cards)
  unreadBg: '#eff6ff',         // Light blue (unread items)
  textDark: '#1e293b',         // Dark gray (titles)
  textMedium: '#64748b',       // Medium gray (content)
  textLight: '#94a3b8',        // Light gray (timestamps)
  border: '#e2e8f0',           // Dividers
}
```

### Typography
- **Header Title**: 24px, bold
- **Card Title**: 14px, bold
- **Message**: 13px, regular, line-height 18px
- **Date**: 11px, regular
- **Action Buttons**: 12px, bold

---

## Code Snippets

### NotificationsScreen Header with Back Button
```javascript
<View style={styles.header}>
  <TouchableOpacity 
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="arrow-back" size={24} color="#1e293b" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>
    Notifikasi {unreadCount > 0 && `(${unreadCount})`}
  </Text>
  <View style={styles.headerSpacer} />
</View>
```

### Filter Picker
```javascript
<Picker
  selectedValue={filter}
  onValueChange={setFilter}
  style={styles.picker}
>
  <Picker.Item label="Semua" value="all" />
  <Picker.Item label="Belum Dibaca" value="unread" />
  <Picker.Item label="Sudah Dibaca" value="read" />
</Picker>
```

### Notification Item
```javascript
<TouchableOpacity
  key={notif.id}
  style={[
    styles.notificationItem,
    !notif.isRead && styles.notificationUnread,
  ]}
  onPress={() => !notif.isRead && markAsRead(notif.id)}
  onLongPress={() => deleteNotification(notif.id)}
>
  <View style={styles.notificationContent}>
    <View style={styles.notificationHeader}>
      <Text style={styles.notificationTitle}>{notif.title}</Text>
      {!notif.isRead && <View style={styles.unreadDot} />}
    </View>
    <Text style={styles.notificationMessage}>{notif.message}</Text>
    <Text style={styles.notificationDate}>
      {formatDateTime(notif.createdAt)}
    </Text>
  </View>
  <TouchableOpacity
    style={styles.deleteButton}
    onPress={() => deleteNotification(notif.id)}
  >
    <Text style={styles.deleteButtonText}>🗑️</Text>
  </TouchableOpacity>
</TouchableOpacity>
```

### Dashboard Badge
```javascript
{unreadCount > 0 && (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{unreadCount}</Text>
  </View>
)}
```

**Badge Styles:**
```javascript
badge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: '#dc2626',
  borderRadius: 10,
  minWidth: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 6,
},
badgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
},
```

---

## Files Modified

### 1. NotificationsScreen.js
**Changes:**
- ✅ Added `navigation` prop
- ✅ Added `Ionicons` import
- ✅ Added back button in header
- ✅ Updated header layout (flexbox row)
- ✅ Adjusted header title font size (28px → 24px)
- ✅ Added `backButton` and `headerSpacer` styles

**Line Changes:**
```javascript
// Line 1-15: Added Ionicons import
import { Ionicons } from '@expo/vector-icons';

// Line 17: Added navigation prop
export default function NotificationsScreen({ navigation }) {

// Line 124-132: Added back button to header
<View style={styles.header}>
  <TouchableOpacity 
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="arrow-back" size={24} color="#1e293b" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>
    Notifikasi {unreadCount > 0 && `(${unreadCount})`}
  </Text>
  <View style={styles.headerSpacer} />
</View>

// Line 218-233: Updated header styles
header: {
  backgroundColor: '#ffffff',
  padding: 20,
  paddingTop: 60,
  borderBottomWidth: 1,
  borderBottomColor: '#e2e8f0',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
backButton: {
  padding: 4,
},
headerSpacer: {
  width: 32,
},
```

### 2. App.js
**Changes:**
- ✅ Added NotificationsScreen to Stack Navigator
- ✅ Positioned between Main and Camera screens

**Line Changes:**
```javascript
// Line 113-120: Added Notifications stack screen
<Stack.Screen 
  name="Notifications" 
  component={NotificationsScreen}
  options={{ 
    headerShown: false,
    presentation: 'card'
  }}
/>
```

### 3. DashboardScreen.js
**No changes needed** - Already has:
- ✅ Quick action button with navigation
- ✅ Badge count display
- ✅ Notification section with "Lihat Semua" link
- ✅ Mark as read functionality

---

## Testing Checklist

### Navigation
- [ ] Dashboard Quick Action button navigates to Notifications
- [ ] Dashboard "Lihat Semua" link navigates to Notifications
- [ ] Back button in Notifications returns to Dashboard
- [ ] Navigation animation is smooth (card presentation)

### Badge Count
- [ ] Badge shows correct unread count on Dashboard
- [ ] Badge shows in header title on Notifications page
- [ ] Badge updates after marking as read
- [ ] Badge disappears when unread count is 0

### Filter
- [ ] "Semua" shows all notifications
- [ ] "Belum Dibaca" shows only unread
- [ ] "Sudah Dibaca" shows only read
- [ ] Filter changes refresh the list

### Actions
- [ ] Tap on unread notification marks it as read
- [ ] "Tandai Semua" marks all as read
- [ ] "Bersihkan" clears all read notifications (with confirmation)
- [ ] Delete button removes single notification (with confirmation)
- [ ] Long press also triggers delete confirmation
- [ ] Pull to refresh reloads notifications

### UI/UX
- [ ] Unread notifications have blue background & teal border
- [ ] Read notifications have white background
- [ ] Unread dot appears for unread notifications
- [ ] Date formatting is correct (formatDateTime)
- [ ] Empty state shows "Tidak ada notifikasi"
- [ ] Loading state shows "Loading..."
- [ ] Styling matches theme (teal #4DB8B8)

---

## User Flow

```
1. User opens Dashboard
   ↓
2. Sees notification badge (if unread > 0)
   ↓
3a. Taps "Notifications" quick action button
    OR
3b. Scrolls to notification section → Taps "Lihat Semua"
   ↓
4. NotificationsScreen opens
   ↓
5a. Views all notifications (scrollable)
5b. Filters by status (all/unread/read)
5c. Taps unread notification → marked as read
5d. Long press → delete confirmation
5e. Taps "Tandai Semua" → all marked as read
5f. Taps "Bersihkan" → read notifications cleared
   ↓
6. Taps back button
   ↓
7. Returns to Dashboard
   ↓
8. Badge count updated (if changed)
```

---

## Related Files

### Core Files
1. `/mobile-app/src/screens/NotificationsScreen.js` - Main notification screen
2. `/mobile-app/src/screens/DashboardScreen.js` - Dashboard with notification preview
3. `/mobile-app/App.js` - Navigation setup
4. `/mobile-app/src/services/index.js` - notificationService API calls
5. `/mobile-app/src/utils/dateFormatter.js` - formatDateTime helper

### Reference Files (Web)
- `/client_Salmon-HRIS/src/components/NotificationPanel.jsx` - Web notification panel
- `/server/routes/notification.js` - Backend notification routes
- `/server/controllers/notificationController.js` - Backend notification logic

---

## API Service Methods

**From `/mobile-app/src/services/index.js`:**

```javascript
export const notificationService = {
  getNotifications: async (filter = 'all') => {
    const response = await api.get(config.API_ENDPOINTS.NOTIFICATIONS, {
      params: { filter },
    });
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await api.patch(config.API_ENDPOINTS.NOTIFICATIONS_MARK_READ(id));
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.post(config.API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
    return response.data;
  },
  
  clearReadNotifications: async () => {
    const response = await api.delete(config.API_ENDPOINTS.NOTIFICATIONS_CLEAR_READ);
    return response.data;
  },
  
  deleteNotification: async (id) => {
    const response = await api.delete(config.API_ENDPOINTS.NOTIFICATIONS_DELETE(id));
    return response.data;
  },
};
```

---

## Known Issues & Future Improvements

### Current Limitations
- ⚠️ No push notifications (only in-app)
- ⚠️ No notification categories/types filtering
- ⚠️ No search functionality
- ⚠️ No notification preferences/settings

### Future Enhancements
- 🔔 Push notifications with Expo Notifications
- 🏷️ Category badges (Leave, Attendance, Payroll, etc.)
- 🔍 Search notifications
- ⚙️ Notification preferences (enable/disable types)
- 📱 Notification sounds
- 🔄 Real-time updates (WebSocket)
- 📊 Notification analytics

---

## Color Theme Consistency

All notification UI elements use the **Salmon Teal** theme:

| Element | Color | Usage |
|---------|-------|-------|
| Primary Action | `#4DB8B8` | Buttons, borders, dots |
| Danger Action | `#dc2626` | Delete, clear actions |
| Unread Background | `#eff6ff` | Light blue tint |
| Unread Border | `#4DB8B8` | Left accent border |
| Read Background | `#ffffff` | White |
| Text Dark | `#1e293b` | Titles |
| Text Medium | `#64748b` | Content |
| Text Light | `#94a3b8` | Timestamps |
| Page Background | `#f8fafc` | Light gray |

This matches the overall app theme where teal (`#4DB8B8`) is the primary brand color, consistent with the Salmon logo.

---

**Status:** ✅ Fully Implemented
**Tested:** Pending user verification
**Documentation:** Complete
