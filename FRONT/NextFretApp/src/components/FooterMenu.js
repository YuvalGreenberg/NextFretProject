// src/components/FooterMenu.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function FooterMenu() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;
  

  const icon = (route, filledName, outlineName) =>
    currentRoute === route ? filledName : outlineName;

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Main')}>
        <Ionicons name={icon('Main', 'home', 'home-outline')} size={24} color="#386641" />
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyLibrary')}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name={icon('MyLibrary', 'library', 'library-outline')} size={24} color="#386641" />
          <Text style={styles.label}>Library</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RecommendationScreen')}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name={icon('RecommendationScreen', 'sparkles', 'sparkles-outline')} size={24} color="#386641" />
          <Text style={styles.label}>Discover</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Search')}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name={icon('Search', 'search', 'search-outline')} size={24} color="#386641" />
          <Text style={styles.label}>Search</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name={icon('Profile', 'person', 'person-outline')} size={24} color="#386641" />
          <Text style={styles.label}>Profile</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',    
    zIndex: 10,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',     
    marginBottom: 20,// פה תיזמו את הפדינג
  },
  label: {
    fontSize: 10,
    color: '#386641',
    marginTop: 4,
  },
});