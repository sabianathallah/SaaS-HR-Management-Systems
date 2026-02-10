import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { attendanceService } from '../services';

export default function CameraScreen({ route, navigation }) {
  const { action } = route.params; // 'clock-in' or 'clock-out'
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (locationStatus === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    if (!location) {
      Alert.alert(
        'GPS Tidak Tersedia',
        'Lokasi GPS belum tersedia. Pastikan GPS Anda aktif dan izin lokasi telah diberikan.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      console.log('📸 Photo taken:', photo.uri);
      console.log('📍 GPS Location:', { latitude: location.latitude, longitude: location.longitude });

      // Submit attendance
      const response = action === 'clock-in'
        ? await attendanceService.clockIn(photo, location.latitude, location.longitude)
        : await attendanceService.clockOut(photo, location.latitude, location.longitude);

      console.log('✅ Attendance response:', response);

      // Response from backend always has message property on success
      const successMessage = action === 'clock-in' 
        ? 'Clock-in berhasil!\n\nAbsensi Anda telah tercatat.' 
        : 'Clock-out berhasil!\n\nTerima kasih atas kerja keras Anda hari ini.';

      Alert.alert(
        'Berhasil!',
        successMessage,
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('Dashboard')
        }]
      );
    } catch (error) {
      console.error('Camera error:', error);
      
      // Better error handling with specific messages
      let errorTitle = 'Gagal';
      let errorMessage = 'Terjadi kesalahan saat melakukan absensi';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Customize error messages
        if (errorMessage.includes('Already clocked in')) {
          errorTitle = 'Sudah Clock-In';
          errorMessage = 'Anda sudah melakukan clock-in hari ini.\n\nSilakan lakukan clock-out jika ingin mengakhiri absensi.';
        } else if (errorMessage.includes('No clock-in')) {
          errorTitle = 'Belum Clock-In';
          errorMessage = 'Anda belum melakukan clock-in hari ini.\n\nSilakan clock-in terlebih dahulu sebelum clock-out.';
        } else if (errorMessage.includes('already clocked out')) {
          errorTitle = 'Sudah Clock-Out';
          errorMessage = 'Anda sudah melakukan clock-out hari ini.';
        }
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraType = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4DB8B8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Kamera dan GPS diperlukan untuk attendance
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Izinkan Akses Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>
              {action === 'clock-in' ? 'Memproses Clock-In...' : 'Memproses Clock-Out...'}
            </Text>
            <Text style={styles.loadingSubtext}>Mohon tunggu sebentar</Text>
          </View>
        </View>
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {action === 'clock-in' ? 'Clock In' : 'Clock Out'}
          </Text>
        </View>

        <View style={styles.info} pointerEvents="box-none">
          <Text style={styles.infoText}>
            GPS: {location ? 'Aktif' : 'Menunggu...'}
          </Text>
          {location && (
            <Text style={styles.infoTextSmall}>
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        <View style={styles.footer} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
            disabled={loading}
          >
            <Text style={styles.flipButtonText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, (loading || !location) && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={loading || !location}
          >
            {loading ? (
              <ActivityIndicator color="#4DB8B8" size="small" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 40,
  },
  info: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoTextSmall: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 24,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4DB8B8',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4DB8B8',
  },
  placeholder: {
    width: 50,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#4DB8B8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
