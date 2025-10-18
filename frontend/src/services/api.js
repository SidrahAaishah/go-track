import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use this for Android Emulator
const API_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default api;