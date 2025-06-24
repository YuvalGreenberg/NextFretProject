// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet
} from 'react-native';
import API_URL from '../config';
import AuthContext from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      console.log('🔐 Attempting login with:', email, password);
      console.log('📡 Sending request to:', `${API_URL}/api/userManager/login`);

      const response = await fetch(`${API_URL}/api/userManager/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      console.log('📥 Response status:', response.status);
      console.log('📥 Response body:', responseText);

      if (response.status === 200) {
        const user = JSON.parse(responseText);
        // שמירת userId ו-token ב-SecureStore דרך Context
        await signIn({ id: String(user.id), token: String(user.token) });
      } else {
        Alert.alert('Login Failed', responseText || 'Unknown error');
      }
    } catch (error) {
      console.error('🔥 Error during login:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text
        style={styles.link}
        onPress={() => navigation.navigate('Register')}
      >
        Don't have an account? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  link: {
    marginTop: 16,
    color: 'blue',
    textAlign: 'center',
  },
});
