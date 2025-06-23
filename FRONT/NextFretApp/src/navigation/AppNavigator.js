// /src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainScreen from '../screens/MainScreen';
import MyChordsScreen from '../screens/MyChordsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
// מי שרוצה יכול להוסיף מסך חיפוש שירים, אם רוצים תפריט נפרד:
import SearchResultsScreen from '../screens/SearchResultsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
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
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{ title: 'NextFret Home' }}
      />
      <Stack.Screen
        name="MyChords"
        component={MyChordsScreen}
        options={{ title: 'My Chords' }}
      />
      <Stack.Screen
        name="RecommendationsFull"
        component={RecommendationsScreen}
        options={{ title: 'All Recommendations' }}
      />
      <Stack.Screen
        name="SearchResultScreen"
        component={SearchResultsScreen}
        options={{ title: 'Search Songs' }}
      />
    </Stack.Navigator>
  );
}