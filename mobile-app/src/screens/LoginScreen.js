import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../services';
import { storageService } from '../services/storage';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 LoginScreen: Attempting login...');
      console.log('🔐 Email:', email);
      
      const response = await authService.login(email, password);
      
      console.log('✅ LoginScreen: Login response received');
      console.log('✅ Response keys:', Object.keys(response));
      console.log('✅ Has access_token:', !!response.access_token);
      console.log('✅ Has user:', !!response.user);
      
      // Backend returns: { access_token, user }
      if (response.access_token && response.user) {
        console.log('💾 LoginScreen: Saving token and user...');
        
        // Save token and user data
        await storageService.saveToken(response.access_token);
        await storageService.saveUser(response.user);
        
        console.log('✅ LoginScreen: Token and user saved');
        console.log('✅ User:', response.user.name, '-', response.user.email);
        
        // Verify saved
        const savedToken = await storageService.getToken();
        const savedUser = await storageService.getUser();
        console.log('🔍 Verification - Token saved:', !!savedToken);
        console.log('🔍 Verification - User saved:', !!savedUser);
        
        // Trigger App.js to update isLoggedIn state
        if (onLoginSuccess) {
          console.log('📞 LoginScreen: Calling onLoginSuccess callback');
          onLoginSuccess();
        }
        
        console.log('🎉 LoginScreen: Login complete!');
      } else {
        console.error('❌ LoginScreen: Invalid response format');
        console.error('❌ Response:', response);
        Alert.alert('Error', 'Login gagal: Format response tidak valid');
      }
    } catch (error) {
      console.error('❌ LoginScreen: Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error message:', error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Terjadi kesalahan saat login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Salmon HRIS</Text>
          <Text style={styles.subtitle}>Employee Management System</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Demo: budi@company.com / password123
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  loginButton: {
    backgroundColor: '#4DB8B8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
