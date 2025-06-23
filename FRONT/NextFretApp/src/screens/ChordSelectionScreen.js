// NextFretApp/src/screens/ChordSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import ChordCheckbox from '../components/ChordCheckbox';
import API_URL from '../config';

const AVAILABLE_CHORDS = ['C', 'G', 'D', 'Em', 'Am', 'F'];

export default function ChordSelectionScreen({ navigation, route }) {
  const { userId } = route.params;
  const [selectedChords, setSelectedChords] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial = {};
    AVAILABLE_CHORDS.forEach(chord => { initial[chord] = false; });
    setSelectedChords(initial);
  }, []);

  const toggleChord = chord => {
    setSelectedChords(prev => ({ ...prev, [chord]: !prev[chord] }));
  };

  const handleRecommend = async () => {
    const chordsArray = Object.keys(selectedChords).filter(key => selectedChords[key]);
    if (chordsArray.length === 0) {
      Alert.alert('Select at least one chord');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/recommendationEngine/user/${userId}`);
      if (response.ok) {
        const songs = await response.json();
        setLoading(false);
        navigation.navigate('Recommendations', { songs });
      } else {
        const errorText = await response.text();
        setLoading(false);
        Alert.alert('Error', errorText);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  if (!selectedChords) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Known Chords</Text>
      <FlatList
        data={AVAILABLE_CHORDS}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <ChordCheckbox
            label={item}
            checked={selectedChords[item]}
            onToggle={() => toggleChord(item)}
          />
        )}
      />
      <Button title="Recommend Songs" onPress={handleRecommend} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
});
