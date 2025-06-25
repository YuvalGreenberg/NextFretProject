// NextFretApp/src/screens/MyChordsScreen.js

import React, { useState, useEffect, useCallback, useContext } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import API_URL from '../config';
import AuthContext from '../contexts/AuthContext';

export default function MyChordsScreen({ navigation, route }) {
  const { userId } = useContext(AuthContext);

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
  
    // עדכון מיידי ל־UI – רק שינוי הצבע
    setChords(prev =>
      prev.map(c =>
        c.id === item.id ? { ...c, known: !isKnown } : c
      )
    );
  
    // סנכרון עם השרת (אופציונלי)
    try {
      const url = `${API_URL}/api/userManager/${userId}/chords${isKnown ? `/${item.id}` : ''}`;
      const options = isKnown
        ? { method: 'DELETE' }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chordId: item.id }),
          };
  
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error('Sync failed');
      }
    } catch (err) {
      console.error('🔴 Network error:', err);
      Alert.alert('Warning', 'Update failed on server');
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
        { backgroundColor: item.known ? '#A7C957' : '#f7f7f7' },
      ]}
      onPress={() => handleToggleChord(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.chordGridText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      

      {/* שורת חיפוש */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Chord"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
          underlineColorAndroid="transparent"
        />
      </View>

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
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 8, textAlign: 'center' },
  /*
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f2f2f2',
    marginBottom: 12,
    fontSize: 16,
  },
  */
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});