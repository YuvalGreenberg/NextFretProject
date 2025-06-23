import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function SongDetailScreen({ route }) {
  const { song } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.sectionHeader}>Lyrics:</Text>
      <Text style={styles.lyrics}>{song.lyrics || 'No lyrics available.'}</Text>
      <Text style={styles.sectionHeader}>Chords:</Text>
      {song.chordList && song.chordList.length > 0 ? (
        song.chordList.map(chord => (
          <Text key={chord.id} style={styles.chordText}>{chord.name}</Text>
        ))
      ) : (
        <Text>No chords available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sectionHeader: { fontSize: 18, marginTop: 12, fontWeight: '600' },
  lyrics: { marginTop: 8, fontSize: 16, lineHeight: 22 },
  chordText: { marginTop: 4, fontSize: 16 },
});
