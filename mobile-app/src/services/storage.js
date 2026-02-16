import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  // Save token
  saveToken: async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  // Get token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Save user data
  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      // Save company data if available
      if (user.company) {
        await AsyncStorage.setItem('company', JSON.stringify(user.company));
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  // Get user data
  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Get company data
  getCompany: async () => {
    try {
      const company = await AsyncStorage.getItem('company');
      return company ? JSON.parse(company) : null;
    } catch (error) {
      console.error('Error getting company:', error);
      return null;
    }
  },

  // Clear all data (logout)
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'company']);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
