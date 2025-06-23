// src/screens/MainScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import API_URL from '../config';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import FooterMenu from '../components/FooterMenu';
import { AuthContext } from '../../App';

export default function MainScreen({ navigation }) {
  // משיכת userId מה-Context במקום route.params
  const { userId } = useContext(AuthContext);

  const [myChords, setMyChords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recommended, setRecommended] = useState([]);
  const [loadingChords, setLoadingChords] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoadingChords(true);
      fetch(`${API_URL}/api/userManager/${userId}/chords`)
        .then(res => res.json())
        .then(data => setMyChords(data))
        .catch(err => console.error(err))
        .finally(() => setLoadingChords(false));
    }, [userId])
  );

  useEffect(() => {
    setLoadingRecs(true);
    fetch(`${API_URL}/api/recommendationEngine/user/${userId}`)
      .then(res => res.json())
      .then(data => setRecommended(data.slice(0, 5)))
      .catch(err => console.error(err))
      .finally(() => setLoadingRecs(false));
  }, [userId]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    navigation.navigate('SearchResults');
  };

  const renderChordItem = ({ item }) => (
    <View style={styles.chordItem}>
      <Text style={styles.chordText}>{item.name}</Text>
    </View>
  );

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => navigation.navigate('SongDetail', { song: item })}
    >
      <Text style={styles.songTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* חלק עליון: כותרת ואקורדים */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Chords</Text>
            {loadingChords ? (
              <ActivityIndicator size="small" />
            ) : (
              <FlatList
                horizontal
                data={myChords}
                keyExtractor={item => item.id.toString()}
                renderItem={renderChordItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No chords yet</Text>}
              />
            )}
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => navigation.navigate('MyChords')}
            >
              <Text style={styles.arrowText}>›››</Text>
            </TouchableOpacity>
          </View>

          {/* חיפוש שירים */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Song by Name</Text>
            <View style={styles.searchRow}>
              <TextInput
                placeholder="Type song name..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.searchInput}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* המלצות */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Songs</Text>
            {loadingRecs ? (
              <ActivityIndicator size="small" />
            ) : (
              <FlatList
                data={recommended}
                keyExtractor={item => item.id.toString()}
                renderItem={renderSongItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No recommendations</Text>}
              />
            )}
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => navigation.navigate('RecommendationsFull')}
            >
              <Text style={styles.arrowText}>›››</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FooterMenu navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, justifyContent: 'space-between' },
  content: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  safeArea: { flex: 1, backgroundColor: '#fff' },

  chordItem: {
    backgroundColor: '#F2E8CF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chordText: { fontSize: 14 },

  arrowButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  arrowText: { fontSize: 24, color: '#386641' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#386641',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  searchButtonText: { color: '#fff' },

  songItem: {
    paddingVertical: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  songTitle: { fontSize: 16 },

  emptyText: { color: '#888' },
});
