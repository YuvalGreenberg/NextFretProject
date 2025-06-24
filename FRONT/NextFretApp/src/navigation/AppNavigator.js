// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../../App';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import MainScreen from '../screens/MainScreen';
import MyLibraryScreen from '../screens/MyLibraryScreen';
import MyChordsScreen from '../screens/MyChordsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import SongDetailScreen from '../screens/SongDetailScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Register' }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyLibrary"
        component={MyLibraryScreen}
        options={{
                   title: 'My Library',                  
                   headerBackVisible: false,                      
                   
                 }}
      />
      <Stack.Screen
        name="MyChords"
        component={MyChordsScreen}
        options={{ title: 'My Chords' }}
      />
      <Stack.Screen
        name="RecommendationScreen"
        component={RecommendationsScreen}
        options={{ title: 'All Recommendations' }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Search Songs' }}
      />
      <Stack.Screen
        name="SongDetail"
        component={SongDetailScreen}
        options={{ title: 'Song Detail' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { userId } = useContext(AuthContext);
  return userId == null ? <AuthStack /> : <AppStack />;
}
