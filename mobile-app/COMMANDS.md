# 🎯 Salmon HRIS Mobile - Getting Started

## ⚡ Quick Commands Reference

### 🚀 Start Development

```bash
# 1. Navigate to mobile-app folder
cd mobile-app

# 2. Start the app (Metro bundler)
npm start

# Then press:
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator  
# - Press 'w' for Web browser
# - Scan QR code with Expo Go app for physical device
```

### 🔧 Useful Commands

```bash
# Clear cache and restart
npm start -- --clear

# Install dependencies
npm install

# Run on iOS Simulator (Mac only)
npm run ios

# Run on Android Emulator
npm run android

# Run on web browser
npm run web

# Check for issues
npm audit

# Fix issues
npm audit fix
```

## 📋 Pre-Launch Checklist

Before running the app, make sure:

- [ ] Backend server is running (`cd ../server && npm start`)
- [ ] Backend is accessible on `http://localhost:3000`
- [ ] `.env` file is created from `.env.example`
- [ ] API_BASE_URL in `.env` is correct for your platform:
  - iOS Simulator: `http://localhost:3000/api`
  - Android Emulator: `http://10.0.2.2:3000/api`
  - Physical Device: `http://YOUR_IP:3000/api`

## 🔐 Login Credentials

```
Email: employee@salmon.com
Password: password123
```

## 📱 App Navigation Structure

```
┌─────────────────────────────────────────┐
│          Login Screen                    │
└────────────────┬────────────────────────┘
                 │ (After Login)
                 ▼
┌─────────────────────────────────────────┐
│      Bottom Tab Navigation               │
├─────────┬─────────┬─────────┬───────────┤
│Dashboard│Attendnce│  Leave  │    Notif  │Profile
└─────────┴─────────┴─────────┴───────────┘
                 │
                 ├─► Camera Screen (Modal)
                 ├─► Attendance Details
                 ├─► Leave Form
                 └─► Overtime Form
```

## 🎯 Testing Flow

### First Launch Test
1. ✅ Open app → See login screen
2. ✅ Enter credentials → Login successful
3. ✅ See dashboard → Shows today's status
4. ✅ Navigate tabs → All 5 tabs work

### Attendance Test
1. ✅ Go to Attendance tab
2. ✅ Tap "Clock In" → Camera opens
3. ✅ Allow camera permission
4. ✅ Allow location permission
5. ✅ Take photo → Clock in successful
6. ✅ Check attendance history

### Leave Request Test
1. ✅ Go to Leave tab
2. ✅ View leave balance
3. ✅ Tap "Ajukan Cuti/Izin"
4. ✅ Fill form (type, dates, reason)
5. ✅ Optional: Attach file
6. ✅ Submit → Success

### Notification Test
1. ✅ Go to Notifications tab
2. ✅ See all notifications
3. ✅ Tap unread notification → Marks as read
4. ✅ Filter by read/unread
5. ✅ Mark all as read

### Profile Test
1. ✅ Go to Profile tab
2. ✅ View profile info
3. ✅ Edit profile name
4. ✅ Change password
5. ✅ Logout

## 🐛 Troubleshooting Guide

### Problem: Can't connect to backend

**Solution:**
```bash
# 1. Check if backend is running
cd ../server
npm start

# 2. Verify .env file
cat .env
# Should show: API_BASE_URL=http://localhost:3000/api

# 3. For Android Emulator, change to:
API_BASE_URL=http://10.0.2.2:3000/api

# 4. For physical device, use your computer's IP:
API_BASE_URL=http://192.168.1.100:3000/api
# (Find your IP with: ipconfig getifaddr en0 on Mac)
```

### Problem: Camera not working

**Solution:**
- Make sure you allowed camera permissions
- iOS Simulator has limited camera (test on real device)
- Check app.json has camera permissions

### Problem: GPS/Location not working

**Solution:**
- Allow location permissions when prompted
- Enable location services on device
- For iOS Simulator: Features > Location > Apple (for testing)

### Problem: Dependencies error

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Or clear cache
npm start -- --clear
```

### Problem: Expo won't start

**Solution:**
```bash
# Make sure you're in mobile-app folder
pwd
# Should show: .../mobile-app

# Kill any running processes
killall node

# Start again
npm start
```

## 📊 File Organization

```
mobile-app/
├── App.js                 # Main entry, navigation setup
├── package.json           # Dependencies
├── app.json              # Expo config
├── .env                  # Environment variables (create this!)
│
├── src/
│   ├── screens/          # 7 screen components
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── AttendanceScreen.js
│   │   ├── LeaveScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── ProfileScreen.js
│   │   └── CameraScreen.js
│   │
│   ├── services/         # API integration
│   │   ├── api.js       # Axios instance
│   │   ├── storage.js   # AsyncStorage
│   │   └── index.js     # All API functions
│   │
│   ├── config/
│   │   └── api.js       # API endpoints
│   │
│   └── utils/           # Helper functions
│       ├── dateFormatter.js
│       └── helpers.js
│
└── Documentation
    ├── README.md
    ├── QUICKSTART.md
    ├── SETUP_SUMMARY.md
    └── COMMANDS.md (this file)
```

## 🎨 Customization Tips

### Change Primary Color
Edit styles in each screen file:
```javascript
// Find and replace:
backgroundColor: '#2563eb'  // Current blue
// With your color:
backgroundColor: '#your-color'
```

### Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Add New Screen
1. Create file in `src/screens/YourScreen.js`
2. Import in `App.js`
3. Add to Tab Navigator or Stack Navigator

## 📦 Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build
eas build -p android
```

### iOS IPA
```bash
# Build (requires Apple Developer Account)
eas build -p ios
```

## 🔗 Useful Links

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Axios Docs](https://axios-http.com/)

## 💡 Development Tips

1. **Use Console Logs**
   ```javascript
   console.log('Debug:', variable);
   ```

2. **Check Network Tab**
   - Shake device → Enable Remote JS Debugging
   - Open Chrome DevTools → Network tab

3. **Hot Reload**
   - Shake device → Enable Fast Refresh
   - Changes auto-reload

4. **Error Boundaries**
   - Check red error screen
   - Read stack trace
   - Check console logs

## 🎓 Learning Resources

- Practice with demo account
- Explore each screen's code
- Modify styles to see changes
- Add console.logs to understand flow
- Read component documentation

## ✅ Final Checklist

Before deploying:
- [ ] All features tested
- [ ] No console errors
- [ ] Proper error handling
- [ ] Loading states work
- [ ] Forms validated
- [ ] API calls work
- [ ] Navigation smooth
- [ ] Icons/images load
- [ ] Permissions handled
- [ ] Logout works

---

## 🚀 Ready to Start?

```bash
# Just run these 2 commands:

# Terminal 1 - Start backend
cd ../server && npm start

# Terminal 2 - Start mobile app  
cd mobile-app && npm start
```

Then press **'a'** for Android or **'i'** for iOS!

**Happy Coding! 🎉**
