# Salmon HRIS Mobile App

Mobile application untuk Salmon HR Management System menggunakan React Native & Expo.

## 📱 Tech Stack

- React Native
- Expo SDK
- React Navigation
- Axios untuk API calls
- AsyncStorage untuk local storage

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 atau lebih baru)
- npm atau yarn
- Expo Go app di smartphone (untuk testing)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Or start with specific options
npx expo start          # Normal mode
npx expo start --clear  # Clear cache
npx expo start --tunnel # Tunnel mode (untuk network berbeda)
```

### Running on Device

#### iOS Simulator (Mac only)
```bash
npx expo start
# Press 'i' untuk open iOS simulator
```

#### Android Emulator
```bash
npx expo start
# Press 'a' untuk open Android emulator
```

#### Physical Device
1. Install **Expo Go** app dari App Store / Play Store
2. Run `npx expo start`
3. Scan QR code dengan Expo Go app

## 📁 Project Structure

```
mobile-app/
├── App.js                 # Root component, navigation setup
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration (REQUIRED)
├── package.json          # Dependencies & scripts
│
├── assets/               # Images, fonts, static files
│
└── src/
    ├── config/
    │   └── api.js        # API endpoints & base URL
    │
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── DashboardScreen.js
    │   ├── AttendanceScreen.js
    │   ├── LeaveScreen.js
    │   ├── NotificationsScreen.js
    │   ├── ProfileScreen.js
    │   └── CameraScreen.js
    │
    ├── services/
    │   ├── api.js        # Axios instance & interceptors
    │   ├── index.js      # API service methods
    │   └── storage.js    # AsyncStorage helpers
    │
    └── utils/
        ├── dateFormatter.js  # Date formatting utilities
        └── helpers.js        # General helper functions
```

## ⚙️ Configuration

### API URL

Edit `app.json` untuk mengubah API URL:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP:3000"
    }
  }
}
```

**Platform-specific URLs:**
- **iOS Simulator:** `http://localhost:3000`
- **Android Emulator:** `http://10.0.2.2:3000`
- **Physical Device:** `http://YOUR_MAC_IP:3000` (harus WiFi yang sama)
- **Tunnel Mode:** Auto-configured (recommended)

### Setelah Ubah Config

**WAJIB restart Expo dengan clear cache:**
```bash
npx expo start --clear
```

## 👥 Test Users

```
Admin:
Email: admin@company.com
Password: admin123

Employee 1:
Email: budi@company.com
Password: password123

Employee 2:
Email: ani@company.com
Password: password123
```

## 🔧 Important Files

### REQUIRED Files (JANGAN DIHAPUS):

1. **`App.js`** - Main app entry point
2. **`app.json`** - Expo configuration
3. **`babel.config.js`** - Required untuk Expo transpile code
4. **`package.json`** - Dependencies management
5. **`.gitignore`** - Git ignore rules

### Optional Files:

- **`.expo/`** - Expo cache (auto-generated, git ignored)
- **`node_modules/`** - Dependencies (auto-generated, git ignored)
- **`package-lock.json`** - Lockfile untuk dependencies

## 📝 Features

### Authentication
- Login dengan email & password
- Token-based authentication
- Auto-logout on 401

### Dashboard
- Today's attendance status
- Recent notifications
- Quick actions (Clock In/Out)

### Attendance
- Clock In/Out dengan foto & GPS
- Attendance history
- Monthly statistics

### Leave Management
- Submit leave requests
- View leave balance
- Cancel pending requests
- Leave history

### Overtime
- Submit overtime requests
- Overtime history
- Track approved hours

### Notifications
- Real-time notifications
- Mark as read/unread
- Filter by status

### Profile
- View profile info
- Update profile
- Change password

## 🐛 Troubleshooting

### Data tidak muncul?

1. **Check backend server running:**
   ```bash
   curl http://localhost:3000/test-ip
   ```

2. **Check API URL di app.json sesuai platform**

3. **Clear cache & restart:**
   ```bash
   rm -rf .expo node_modules/.cache
   npx expo start --clear
   ```

4. **Di app: Logout → Close app → Reopen → Login ulang**

### "Network Error"?

- Server backend tidak running
- API URL salah
- Firewall blocking
- Device tidak di network yang sama (untuk physical device)

**Solution:** Use tunnel mode
```bash
npx expo start --tunnel
```

### "Module not found"?

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Metro Bundler error?

```bash
# Clear all caches
rm -rf .expo node_modules/.cache
npx expo start --clear
```

## 📦 Build untuk Production

### iOS (Mac only):
```bash
npx eas build --platform ios
```

### Android:
```bash
npx eas build --platform android
```

### Setup EAS Build:
```bash
npm install -g eas-cli
eas login
eas build:configure
```

## 🔐 Security Notes

- Token disimpan di AsyncStorage (secure)
- API calls menggunakan Bearer token authentication
- Auto-logout on 401 Unauthorized
- Sensitive data di-hash sebelum dikirim ke backend

## 📱 Minimum Requirements

- **iOS:** 13.0+
- **Android:** 5.0+ (API level 21+)

## 🆘 Support

Untuk issues atau questions:
1. Check Metro Bundler console logs
2. Check backend server logs
3. Review error messages di app

## 📄 License

Internal company use only.
