import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChordCheckbox({ label, checked, onToggle }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle}>
      {checked
        ? <Ionicons name="checkbox" size={24} color="black" />
        : <Ionicons name="checkbox-outline" size={24} color="black" />
      }
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
  },
});
