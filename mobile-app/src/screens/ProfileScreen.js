import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { profileService } from '../services';
import { storageService } from '../services/storage';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    position: '',
  });

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        setProfile(response.data);
        setProfileForm({ name: response.data.name });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      const response = await profileService.updateProfile(profileForm);
      if (response.success) {
        Alert.alert('Berhasil', 'Profile berhasil diupdate');
        setShowEditProfile(false);
        fetchProfile();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Semua field password harus diisi');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password baru minimal 6 karakter');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'Password baru dan konfirmasi tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const response = await profileService.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );

      if (response.success) {
        Alert.alert('Berhasil', 'Password berhasil diubah');
        setShowChangePassword(false);
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
              </Text>
            </View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Departemen:</Text>
              <Text style={styles.infoValue}>{profile.department || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jabatan:</Text>
              <Text style={styles.infoValue}>{profile.position || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>{profile.role || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pengaturan Akun</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowEditProfile(true)}
          >
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowChangePassword(true)}
          >
            <Text style={styles.menuIcon}>🔐</Text>
            <Text style={styles.menuText}>Ubah Password</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemDanger]}
            onPress={handleLogout}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuText, styles.menuTextDanger]}>Logout</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Salmon HRIS Mobile v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2026 Salmon Corp</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                style={styles.input}
                value={profileForm.name}
                onChangeText={(value) => setProfileForm({ name: value })}
                placeholder="Masukkan nama"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubah Password</Text>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Password Lama</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordForm.oldPassword}
                  onChangeText={(value) =>
                    setPasswordForm({ ...passwordForm, oldPassword: value })
                  }
                  placeholder="••••••••"
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <Text>{showOldPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Password Baru</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordForm.newPassword}
                  onChangeText={(value) =>
                    setPasswordForm({ ...passwordForm, newPassword: value })
                  }
                  placeholder="••••••••"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Text>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Konfirmasi Password Baru</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordForm.confirmPassword}
                  onChangeText={(value) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: value })
                  }
                  placeholder="••••••••"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowChangePassword(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'Menyimpan...' : 'Ubah Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  infoContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  menuTextDanger: {
    color: '#dc2626',
  },
  menuArrow: {
    fontSize: 24,
    color: '#cbd5e1',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalBody: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  modalButtonSecondary: {
    backgroundColor: '#e2e8f0',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
});
