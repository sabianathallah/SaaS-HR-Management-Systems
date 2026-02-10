# Header Standardization Documentation

## Overview
Standardisasi header design untuk semua screen di mobile app agar konsisten dengan Dashboard header design.

**Tanggal Update:** 10 Februari 2026  
**Screens Updated:** AttendanceScreen, LeaveScreen, OvertimeScreen, PayslipScreen, ProfileScreen

---

## Header Design Specification

### Dashboard Header Design (Reference)
Header pada Dashboard menggunakan design dengan:
- **Logo Salmon HRIS** (50x50px)
- **App Title:** "Salmon HRIS" (fontSize: 20, bold)
- **Screen Subtitle:** "Employee Dashboard" (fontSize: 13, color: #666)
- **Background:** White (#ffffff)
- **Border Bottom:** 1px solid #e5e5e5
- **Shadow:** Subtle shadow untuk depth effect
- **Padding:** Top 50px, Bottom 16px, Horizontal 20px

---

## Implementation Details

### 1. AttendanceScreen Header

**Before:**
```javascript
<View style={styles.header}>
  <Text style={styles.headerTitle}>Attendance</Text>
</View>
```

**After:**
```javascript
<View style={styles.header}>
  <View style={styles.headerContent}>
    <Image 
      source={require('../../assets/salmon-logo.png')} 
      style={styles.logo}
      resizeMode="contain"
    />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>Salmon HRIS</Text>
      <Text style={styles.headerSubtitle}>Attendance Management</Text>
    </View>
  </View>
</View>
```

**Subtitle:** "Attendance Management"

---

### 2. LeaveScreen Header

**Before:**
```javascript
<View style={styles.header}>
  <Text style={styles.headerTitle}>Leave</Text>
</View>
```

**After:**
```javascript
<View style={styles.header}>
  <View style={styles.headerContent}>
    <Image 
      source={require('../../assets/salmon-logo.png')} 
      style={styles.logo}
      resizeMode="contain"
    />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>Salmon HRIS</Text>
      <Text style={styles.headerSubtitle}>Leave Management</Text>
    </View>
  </View>
</View>
```

**Subtitle:** "Leave Management"

---

### 3. OvertimeScreen Header

**Before:**
```javascript
<View style={styles.header}>
  <Text style={styles.headerTitle}>Overtime</Text>
</View>
```

**After:**
```javascript
<View style={styles.header}>
  <View style={styles.headerContent}>
    <Image 
      source={require('../../assets/salmon-logo.png')} 
      style={styles.logo}
      resizeMode="contain"
    />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>Salmon HRIS</Text>
      <Text style={styles.headerSubtitle}>Overtime Management</Text>
    </View>
  </View>
</View>
```

**Subtitle:** "Overtime Management"

---

### 4. PayslipScreen Header

**Before:**
```javascript
<View style={styles.header}>
  <Text style={styles.headerTitle}>Payslip</Text>
</View>
```

**After:**
```javascript
<View style={styles.header}>
  <View style={styles.headerContent}>
    <Image 
      source={require('../../assets/salmon-logo.png')} 
      style={styles.logo}
      resizeMode="contain"
    />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>Salmon HRIS</Text>
      <Text style={styles.headerSubtitle}>Payslip Management</Text>
    </View>
  </View>
</View>
```

**Subtitle:** "Payslip Management"

---

### 5. ProfileScreen Header

**Before:**
```javascript
<View style={styles.header}>
  <Text style={styles.headerTitle}>Profile</Text>
</View>
```

**After:**
```javascript
<View style={styles.header}>
  <View style={styles.headerContent}>
    <Image 
      source={require('../../assets/salmon-logo.png')} 
      style={styles.logo}
      resizeMode="contain"
    />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>Salmon HRIS</Text>
      <Text style={styles.headerSubtitle}>Profile & Settings</Text>
    </View>
  </View>
</View>
```

**Subtitle:** "Profile & Settings"

**Note:** Logout button tetap di bagian bawah screen sesuai permintaan user.

---

## Style Changes

### Import Addition
Semua screens yang diupdate menambahkan import untuk `Image`:

```javascript
import {
  View,
  Text,
  ScrollView,
  // ... other imports
  Image,  // ← Added
} from 'react-native';
```

---

### Standardized Header Styles

**Sebelumnya (Contoh dari AttendanceScreen):**
```javascript
header: {
  backgroundColor: '#ffffff',
  padding: 20,
  paddingTop: 60,
  borderBottomWidth: 1,
  borderBottomColor: '#e2e8f0',
},
headerTitle: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#1e293b',
},
```

**Sesudahnya (Uniform untuk semua screens):**
```javascript
header: {
  backgroundColor: '#ffffff',
  paddingTop: 50,
  paddingBottom: 16,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e5e5',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
},
headerContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
logo: {
  width: 50,
  height: 50,
  marginRight: 12,
},
headerTextContainer: {
  flex: 1,
},
headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
},
headerSubtitle: {
  fontSize: 13,
  color: '#666',
  marginTop: 2,
},
```

---

## Screens NOT Updated

### 1. NotificationsScreen
**Status:** Tidak diupdate (tetap dengan back button)  
**Alasan:** User request - notification page tidak usah ditambahkan logo

**Current Design:**
```javascript
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backButton}>← Kembali</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Notifikasi</Text>
</View>
```

---

## Benefits

### 1. Brand Consistency
- Semua screens menampilkan logo Salmon HRIS
- Consistent branding experience across the app
- Professional look and feel

### 2. Better Navigation Context
- User selalu tahu bahwa mereka di Salmon HRIS app
- Subtitle memberikan context screen yang sedang dibuka
- Improved user orientation

### 3. Visual Hierarchy
- Logo sebagai focal point
- Clear title and subtitle structure
- Better use of whitespace

### 4. Maintainability
- Uniform styling across screens
- Easy to update branding in the future
- Consistent padding and spacing

---

## Testing Checklist

### Visual Testing
- [ ] Logo tampil dengan baik di semua 4 screens
- [ ] Subtitle text sesuai dengan context screen
- [ ] Spacing dan alignment konsisten
- [ ] Shadow effect terlihat di header

### Responsiveness
- [ ] Header responsive di berbagai ukuran layar
- [ ] Logo tidak terdistorsi
- [ ] Text tidak overflow

### Navigation
- [ ] Header tetap fixed saat scroll
- [ ] Tidak ada layout shift saat screen load
- [ ] Smooth transition antar screens

---

## Screen Subtitles Summary

| Screen | Subtitle |
|--------|----------|
| Dashboard | Employee Dashboard |
| Attendance | Attendance Management |
| Leave | Leave Management |
| Overtime | Overtime Management |
| Payslip | Payslip Management |
| Profile | Profile & Settings |
| Notifications | (No logo - back button only) |

---

## Assets Required

### Logo File
- **Path:** `../../assets/salmon-logo.png`
- **Size:** 50x50px
- **Format:** PNG with transparency recommended
- **Resolution:** @2x and @3x versions for different device densities

---

## Code Impact Summary

### Files Modified
1. `mobile-app/src/screens/AttendanceScreen.js`
2. `mobile-app/src/screens/LeaveScreen.js`
3. `mobile-app/src/screens/OvertimeScreen.js`
4. `mobile-app/src/screens/PayslipScreen.js`
5. `mobile-app/src/screens/ProfileScreen.js`

### Changes Per File
- ✅ Added `Image` import from react-native
- ✅ Updated header JSX structure with logo + text container
- ✅ Updated 6-7 style properties for header design
- ✅ Added 5 new style properties (headerContent, logo, headerTextContainer, headerSubtitle, updated headerTitle)

### Lines Changed
- **Total Lines Added:** ~75 lines (across 5 files)
- **Total Lines Modified:** ~50 lines (style updates)

---

## Future Enhancements

### Potential Improvements
1. **Animated Header:** Add fade-in animation when screen loads
2. **Dynamic Subtitle:** Show user-specific context (e.g., "Welcome back, John")
3. **Theme Support:** Add dark mode support for header
4. **Custom Logo:** Allow company logo customization from admin panel
5. **Header Actions:** Add quick action buttons in header (notifications, search, etc.)

### Accessibility
- Consider adding accessibility labels for logo
- Ensure text contrast meets WCAG standards
- Add touch target size for any interactive elements

---

## Rollback Instructions

Jika diperlukan rollback ke design sebelumnya:

1. **Remove Image import:**
```javascript
// Remove Image from imports
import { View, Text, ScrollView, ... } from 'react-native';
```

2. **Revert Header Structure:**
```javascript
<View style={styles.header}>
  <Text style={styles.headerTitle}>[Screen Name]</Text>
</View>
```

3. **Revert Styles:**
```javascript
header: {
  backgroundColor: '#ffffff',
  padding: 20,
  paddingTop: 60,
  borderBottomWidth: 1,
  borderBottomColor: '#e2e8f0',
},
headerTitle: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#1e293b',
},
```

4. **Remove New Styles:**
- Delete: `headerContent`, `logo`, `headerTextContainer`, `headerSubtitle`

---

## Support & Troubleshooting

### Common Issues

**Issue 1: Logo tidak tampil**
- **Cause:** Path logo salah atau file tidak ada
- **Solution:** Pastikan file `salmon-logo.png` ada di `mobile-app/assets/`

**Issue 2: Layout bergeser**
- **Cause:** Padding tidak konsisten
- **Solution:** Pastikan menggunakan exact styles dari dokumentasi ini

**Issue 3: Text overlap**
- **Cause:** TextContainer tidak flexible
- **Solution:** Ensure `headerTextContainer` has `flex: 1`

---

## Conclusion

Header standardization berhasil diimplementasikan pada 4 main screens (Attendance, Leave, Overtime, Payslip) dengan design yang konsisten dengan Dashboard. NotificationsScreen dan ProfileScreen tetap mempertahankan design custom mereka sesuai user requirements.

**Status:** ✅ Complete  
**Impact:** Medium - UI/UX improvement  
**Risk:** Low - Non-breaking change  
**Testing:** Ready for testing
