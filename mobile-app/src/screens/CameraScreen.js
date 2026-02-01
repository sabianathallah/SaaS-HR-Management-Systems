import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { attendanceService } from '../services';

export default function CameraScreen({ route, navigation }) {
  const { action } = route.params; // 'clock-in' or 'clock-out'
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === 'granted');
      
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
      Alert.alert('Error', 'Lokasi GPS belum tersedia');
      return;
    }

    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Submit attendance
      const response = action === 'clock-in'
        ? await attendanceService.clockIn(photo, location.latitude, location.longitude)
        : await attendanceService.clockOut(photo, location.latitude, location.longitude);

      if (response.success) {
        Alert.alert(
          'Berhasil',
          action === 'clock-in' ? 'Clock in berhasil!' : 'Clock out berhasil!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Gagal melakukan attendance');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Terjadi kesalahan'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraType = () => {
    setType(current => 
      current === Camera.Constants.Type.back 
        ? Camera.Constants.Type.front 
        : Camera.Constants.Type.back
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Kamera dan GPS diperlukan untuk attendance
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
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
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {action === 'clock-in' ? 'Clock In' : 'Clock Out'}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.infoText}>
              📍 GPS: {location ? '✓ Aktif' : '⏳ Menunggu...'}
            </Text>
            {location && (
              <Text style={styles.infoTextSmall}>
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraType}
            >
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, loading && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={loading || !location}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
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
    borderColor: '#2563eb',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
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
    backgroundColor: '#2563eb',
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
