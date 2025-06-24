// App.js
import React, { createContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import AppNavigator from './src/navigation/AppNavigator';
import AuthContext from './src/contexts/AuthContext'; 


export default function App() {
  const [userId, setUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);


  
  // 2. בטעינה ראשונית: קרא מה־SecureStore
  useEffect(() => {
    (async () => {
      const storedId = await SecureStore.getItemAsync('userId');
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (storedId && storedToken) {
        setUserId(storedId);
        setAuthToken(storedToken);
      }
      setLoading(false);
    })();
  }, []);

  // 3. פונקציות להתחברות/התנתקות
  const authContextValue = {
    userId,
    authToken,
    signIn: async ({ id, token }) => {
      setUserId(id);
      setAuthToken(token);
      await SecureStore.setItemAsync('userId', id);
      await SecureStore.setItemAsync('authToken', token);
    },
    signOut: async () => {
      setUserId(null);
      setAuthToken(null);
      await SecureStore.deleteItemAsync('userId');
      await SecureStore.deleteItemAsync('authToken');
    }
  };

  if (loading) {
    // אפשר להחזיר פה SplashScreen אם יש
    return null;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
