import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder for getting the device token
const getDeviceToken = async () => {
  console.log('Requesting push notification token...');
  // In a real app, use @react-native-firebase/messaging
  // const token = await messaging().getToken();
  // return token;
  return 'mock-device-token-12345';
};

const DashboardScreen = ({onLogout}) => {
  const [alerts, setAlerts] = useState([]);
  const [coin, setCoin] = useState('BTC');
  const [price, setPrice] = useState('');

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch alerts.');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAddAlert = async () => {
    if (!price) return;
    try {
      const deviceToken = await getDeviceToken();
      const newAlert = {
        coin: coin,
        targetPrice: parseFloat(price),
        deviceToken: deviceToken,
      };
      const response = await api.post('/api/alerts', newAlert);
      setAlerts(prevAlerts => [...prevAlerts, response.data]);
      setPrice('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not add alert.');
    }
  };

  const handleLogout = () => {
    AsyncStorage.removeItem('userToken');
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Alerts</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Coin (e.g., BTC)"
          value={coin}
          onChangeText={setCoin}
        />
        <TextInput
          style={styles.input}
          placeholder="Target Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Button title="Add Alert" onPress={handleAddAlert} />
      </View>

      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.alertItem}>
            <Text style={styles.alertText}>
              {item.coin} ${item.targetPrice}
            </Text>
          </View>
        )}
      />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: 50, padding: 20},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  form: {marginBottom: 20},
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
  },
  alertItem: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  alertText: {fontSize: 18},
});

export default DashboardScreen;