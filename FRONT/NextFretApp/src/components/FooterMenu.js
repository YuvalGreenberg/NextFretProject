// src/components/FooterMenu.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function FooterMenu({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.text}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('MyLibrary')}
      >
        <Text style={styles.text}>My Library</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('RecommendationScreen')}
      >
        <Text style={styles.text}>Recommend</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.text}>Search</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.text}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#386641',
  },
});