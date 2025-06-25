// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthContext from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainScreen from '../screens/MainScreen';
import MyLibraryScreen from '../screens/MyLibraryScreen';
import MyChordsScreen from '../screens/MyChordsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen copy';
import UserScreen from '../screens/UserScreen';
import SearchScreen from '../screens/SearchScreen';
import SongDetailScreen from '../screens/SongDetailScreen';
import MyGenresScreen from '../screens/MyGenreScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

import FooterMenu from '../components/FooterMenu';
import { View, StyleSheet } from 'react-native';

function MainLayout({ children }) {
  return (
    <View style={styles.container}>
      {/* <SafeAreaView style={styles.safeArea}> */}
        <View style={styles.content}>{children}</View>
      {/* </SafeAreaView> */}
      <FooterMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1,
    paddingBottom: 80, // adjust if your footer height is different
  },
});

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false , animation: 'fade', animationDuration: 100 }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false  , animation: 'fade', animationDuration: 100}}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator initialRouteName='RecommendationScreen'
      screenOptions={{
        headerTitleAlign: 'center',
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen
        name="Main"
        options={{ headerShown: false }}
      >
        {props => (
          <MainLayout>
            <MainScreen {...props} />
          </MainLayout>
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Search"
        options={{ title: 'Search', animation: 'fade' , headerBackVisible: false}}
      >
        {props => (
          <MainLayout>
            <SearchScreen {...props} />
          </MainLayout>
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Profile"
        options={{ title: 'Profile', animation: 'fade' , headerBackVisible: false}}
      >
        {props => (
          <MainLayout>
            <UserScreen {...props} />
          </MainLayout>
        )}
      </Stack.Screen>

      <Stack.Screen
        name="MyLibrary"
        options={{
          title: 'Library',
          headerBackVisible: false,
          animation: 'fade',
        }}
      >
        {props => (
          <MainLayout>
            <MyLibraryScreen {...props} />
          </MainLayout>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="MyChords"
        options={{
          title: 'My Chords',
          animation: 'slide_from_bottom',
          //presentation: 'transparentModal',
          animationDuration: 400,
        }}
      >
        {props => (
          <MainLayout>
            <MyChordsScreen {...props} />
          </MainLayout>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="MyGenres"
        options={{
          title: 'My Genres',
          animation: 'slide_from_bottom',
          //presentation: 'transparentModal',
          animationDuration: 400,
        }}
      >
        {props => (
          <MainLayout>
            <MyGenresScreen {...props} />
          </MainLayout>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="RecommendationScreen"
        options={{ title: 'Discover', animation: 'fade' , headerBackVisible: false}}
      >
        {props => (
          <MainLayout>
            <RecommendationsScreen {...props} />
          </MainLayout>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="SongDetail"
        options={{
          title: 'Song Detail',
          animation: 'slide_from_bottom',
          animationDuration: 400,
        }}
      >
        {props => <SongDetailScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { userId } = useContext(AuthContext);
  return userId == null ? <AuthStack /> : <AppStack />;
}