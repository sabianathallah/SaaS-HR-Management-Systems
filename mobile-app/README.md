# Salmon HRIS Mobile App

Mobile application for Salmon HR Management System built with **React Native** and **Expo SDK 54** (Latest).

## 🎉 Latest Update

**✅ Upgraded to Expo SDK 54** - Latest version with React Native 0.76.6!

See [EXPO_SDK_54_UPGRADE.md](./EXPO_SDK_54_UPGRADE.md) for details.

## 🚀 Features

- **Authentication** - Login & Logout
- **Dashboard** - Overview of today's attendance and notifications
- **Attendance Management**
  - Clock In/Out with camera and GPS
  - View attendance history
  - Attendance statistics (daily, weekly, monthly)
- **Leave Management**
  - Submit leave requests (Annual Leave, Sick Leave, Permission)
  - View leave balance
  - Track leave request status
  - Cancel pending requests
- **Overtime Management**
  - Request overtime
  - View overtime history
  - Cancel pending overtime requests
- **Notifications**
  - Real-time notifications
  - Mark as read/unread
  - Filter notifications
- **Profile Management**
  - View profile information
  - Edit profile
  - Change password

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## 🛠️ Installation

1. **Navigate to mobile-app directory**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   
   Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your backend API URL:
   ```
   API_BASE_URL=http://localhost:3000/api
   ```
   
   **Important:** 
   - For iOS Simulator: Use `http://localhost:3000/api`
   - For Android Emulator: Use `http://10.0.2.2:3000/api`
   - For Physical Device: Use your computer's IP address (e.g., `http://192.168.1.100:3000/api`)

## 🚀 Running the App

1. **Start Metro Bundler**
   ```bash
   npm start
   ```

2. **Run on iOS Simulator (Mac only)**
   ```bash
   npm run ios
   ```

3. **Run on Android Emulator**
   ```bash
   npm run android
   ```

4. **Run on Web Browser**
   ```bash
   npm run web
   ```

## 📱 Testing on Physical Device

1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Run `npm start`
3. Scan the QR code with your device
4. Make sure your device and computer are on the same network

## 🏗️ Project Structure

```
mobile-app/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── babel.config.js            # Babel configuration
├── package.json               # Dependencies
└── src/
    ├── config/
    │   └── api.js             # API endpoints configuration
    ├── screens/
    │   ├── LoginScreen.js     # Login screen
    │   ├── DashboardScreen.js # Dashboard screen
    │   ├── AttendanceScreen.js # Attendance management
    │   ├── LeaveScreen.js     # Leave & overtime management
    │   ├── NotificationsScreen.js # Notifications
    │   ├── ProfileScreen.js   # Profile & settings
    │   └── CameraScreen.js    # Camera for attendance
    ├── services/
    │   ├── api.js             # Axios instance with interceptors
    │   ├── storage.js         # AsyncStorage helper
    │   └── index.js           # API service functions
    └── utils/
        ├── dateFormatter.js   # Date formatting utilities
        └── helpers.js         # Helper functions
```

## 🔧 API Integration

The app connects to the backend server through REST API. Make sure your backend server is running before using the app.

### Backend Setup

1. Make sure the backend server is running:
   ```bash
   cd ../server
   npm start
   ```

2. The server should be running on `http://localhost:3000`

### API Endpoints Used

- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance/clock-in` - Clock in with photo & GPS
- `POST /api/attendance/clock-out` - Clock out with photo & GPS
- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Create leave request
- `GET /api/overtime` - Get overtime requests
- `POST /api/overtime` - Create overtime request
- `GET /api/notifications` - Get notifications

## 📝 Demo Credentials

```
Email: employee@salmon.com
Password: password123
```

## 🎨 Features Highlights

### Camera & GPS Integration
- Uses device camera for attendance photo
- Captures GPS coordinates for location tracking
- Front/back camera toggle
- Real-time location display

### Offline Support
- Token storage using AsyncStorage
- Persists user session

### User Experience
- Pull-to-refresh on all screens
- Loading indicators
- Error handling with user-friendly messages
- Smooth navigation with bottom tabs
- Modal forms for data entry

## 🔒 Permissions Required

- **Camera** - For attendance photo capture
- **Location** - For GPS tracking during attendance
- **Storage** - For file attachments (leave documents)

## 📦 Main Dependencies

- **expo** - ~54.0.0 (Latest SDK)
- **react-native** - 0.76.6 (Latest)
- **react** - 18.3.1
- **react-navigation** - v7.x (Latest)
- **axios** - HTTP client
- **expo-camera** - Camera access (v16 - New CameraView API)
- **expo-location** - GPS/Location services
- **expo-document-picker** - File picker
- **@react-native-async-storage/async-storage** - Local storage
- **react-native-paper** - UI components

## 🐛 Troubleshooting

### Connection Issues

If you can't connect to the backend:

1. Check if backend server is running
2. Verify the API_BASE_URL in `.env`
3. For Android Emulator, use `10.0.2.2` instead of `localhost`
4. For physical device, use your computer's local IP address

### Camera/GPS Not Working

1. Make sure you've granted camera and location permissions
2. For iOS Simulator, some features may be limited
3. Test on a physical device for full functionality

### Build Errors

1. Clear cache: `expo start -c`
2. Delete node_modules and reinstall: 
   ```bash
   rm -rf node_modules
   npm install
   ```

## 📱 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is part of Salmon HRIS System.

## 📞 Support

For support and questions, please contact the development team.

---

**Made with ❤️ by Salmon Dev Team**
