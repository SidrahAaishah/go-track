import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder for navigation
// You would get 'onLoginSuccess' from props via react-navigation
const LoginScreen = ({onLoginSuccess}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    try {
      const response = await api.post(endpoint, {username, password});

      if (isRegistering) {
        Alert.alert('Success', 'User registered! Please log in.');
        setIsRegistering(false);
      } else {
        const {token} = response.data;
        await AsyncStorage.setItem('userToken', token);
        onLoginSuccess(); // Tell App.js to re-render
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Authentication failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Go-Track {isRegistering ? 'Register' : 'Login'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isRegistering ? 'Register' : 'Login'} onPress={handleAuth} />
      <Button
        title={`Switch to ${isRegistering ? 'Login' : 'Register'}`}
        onPress={() => setIsRegistering(!isRegistering)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 20},
  title: {fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20},
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
  },
});

export default LoginScreen;