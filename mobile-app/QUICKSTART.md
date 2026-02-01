# Quick Start Guide - Salmon HRIS Mobile App

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend Server
```bash
# In a new terminal, navigate to server folder
cd ../server
npm start
```

### Step 2: Configure API URL
```bash
# In mobile-app folder
cp .env.example .env
```

Edit `.env` file:
- **For iOS Simulator**: `API_BASE_URL=http://localhost:3000/api`
- **For Android Emulator**: `API_BASE_URL=http://10.0.2.2:3000/api`
- **For Physical Device**: `API_BASE_URL=http://YOUR_IP:3000/api`

### Step 3: Start Mobile App
```bash
# Make sure you're in mobile-app folder
npm start
```

Then press:
- **i** for iOS Simulator
- **a** for Android Emulator
- Scan QR code for physical device

### Step 4: Login
```
Email: employee@salmon.com
Password: password123
```

## 📱 Test Features

1. **Dashboard** - See today's status
2. **Clock In** - Tap "Clock In" button, allow camera & GPS permissions
3. **Attendance** - View history and statistics
4. **Leave** - Submit leave request
5. **Overtime** - Request overtime
6. **Notifications** - Check notifications
7. **Profile** - Edit profile or change password

## 🔧 Common Commands

```bash
# Start app
npm start

# Clear cache and start
npm start -- --clear

# Run on iOS
npm run ios

# Run on Android
npm run android

# Install new package
npm install package-name
```

## 💡 Tips

1. **Can't connect to backend?**
   - Check backend is running on port 3000
   - Verify API_BASE_URL in .env
   - For Android: use 10.0.2.2 instead of localhost

2. **Camera not working?**
   - Grant camera permissions when prompted
   - iOS Simulator has limited camera support
   - Test on physical device for best experience

3. **GPS not working?**
   - Grant location permissions
   - Ensure location services are enabled

## 📸 Screenshot Flow

1. Login Screen
2. Dashboard (with clock in/out buttons)
3. Camera Screen (for attendance)
4. Attendance History
5. Leave Request Form
6. Notifications
7. Profile Settings

## 🎯 Next Steps

- Customize the app theme in each screen's styles
- Add more features as needed
- Configure push notifications
- Set up app icon and splash screen
- Build for production

Happy coding! 🎉
