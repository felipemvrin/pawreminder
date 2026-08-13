import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageService } from './storage-service';

export const asyncStorageService: StorageService = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key)
};
