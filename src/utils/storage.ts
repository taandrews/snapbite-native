/**
 * Simplified AsyncStorage implementation for development
 * In production, this would use @react-native-async-storage/async-storage
 */

// In-memory storage for development
const memoryStorage: { [key: string]: string } = {};

export const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // In production: return await AsyncStorageLib.getItem(key);
      return memoryStorage[key] || null;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      // In production: await AsyncStorageLib.setItem(key, value);
      memoryStorage[key] = value;
      console.log(`Saved ${key}:`, value.substring(0, 100) + '...');
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      // In production: await AsyncStorageLib.removeItem(key);
      delete memoryStorage[key];
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      // In production: await AsyncStorageLib.clear();
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  }
};