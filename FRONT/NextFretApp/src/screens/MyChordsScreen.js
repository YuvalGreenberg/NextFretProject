// NextFretApp/src/screens/MyChordsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import API_URL from '../config';

export default function MyChordsScreen({ navigation, route }) {
  const { userId } = route.params; // userId חייב להיות מספר

  const [chords, setChords] = useState([]);           // רשימת כל האקורדים (עם שדה known)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');   // מחרוזת החיפוש

  // בעת טעינת המסך, משוך את כל האקורדים ושל האקורדים שהמשתמש יודע
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`${API_URL}/api/userManager/chords/all`).then(res => res.json()),
      fetch(`${API_URL}/api/userManager/${userId}/chords`).then(res => res.json()),
    ])
      .then(([allChords, userChords]) => {
        if (!isMounted) return;

        const userSet = new Set(userChords.map(c => c.id));
        const merged = allChords.map(c => ({
          id: c.id,
          name: c.name,
          known: userSet.has(c.id),
        }));

        merged.sort((a, b) => {
          if (a.known === b.known) return a.name.localeCompare(b.name);
          return a.known ? -1 : 1;
        });

        setChords(merged);
      })
      .catch(err => {
        console.error('🔴 Error fetching chords:', err);
        Alert.alert('Error', 'Failed to load chords');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [userId]);

  // כאשר לוחצים על אקורד – הוסף או הסר אותו מהמשתמש
  const handleToggleChord = useCallback(async (item) => {
    const isKnown = item.known;

    if (!isKnown) {
      // הוספה
      try {
        const res = await fetch(`${API_URL}/api/userManager/${userId}/chords`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chordId: item.id }),
        });
        if (res.ok) {
          setChords(prev => {
            const updated = prev.map(c =>
              c.id === item.id ? { ...c, known: true } : c
            );
            updated.sort((a, b) => {
              if (a.known === b.known) return a.name.localeCompare(b.name);
              return a.known ? -1 : 1;
            });
            return updated;
          });
        } else {
          Alert.alert('Error', 'Could not add chord');
        }
      } catch (err) {
        console.error('🔴 Network error (add chord):', err);
        Alert.alert('Error', 'Network error');
      }
    } else {
      // הסרה
      try {
        const res = await fetch(
          `${API_URL}/api/userManager/${userId}/chords/${item.id}`,
          { method: 'DELETE' }
        );
        if (res.ok) {
          setChords(prev => {
            const updated = prev.map(c =>
              c.id === item.id ? { ...c, known: false } : c
            );
            updated.sort((a, b) => {
              if (a.known === b.known) return a.name.localeCompare(b.name);
              return a.known ? -1 : 1;
            });
            return updated;
          });
        } else {
          Alert.alert('Error', 'Could not remove chord');
        }
      } catch (err) {
        console.error('🔴 Network error (delete chord):', err);
        Alert.alert('Error', 'Network error');
      }
    }
  }, [userId]);

  // פילטר על פי מחרוזת החיפוש (case-insensitive)
  const filteredChords = chords.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chordGridItem,
        { backgroundColor: item.known ? '#A7C957' : '#F2E8CF' },
      ]}
      onPress={() => handleToggleChord(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.chordGridText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Chords</Text>

      {/* שורת חיפוש */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search chords..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          data={filteredChords}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={
            filteredChords.length === 0 && { flex: 1, justifyContent: 'center' }
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No chords match your search.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 8, textAlign: 'center' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  chordGridItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minWidth: 0,
  },
  chordGridText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20 },
});