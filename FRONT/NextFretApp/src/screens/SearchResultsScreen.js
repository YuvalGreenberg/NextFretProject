// /src/screens/SearchResultsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import API_URL from '../config';

export default function SearchResultsScreen({ route, navigation }) {
  const { query } = route.params; // sent from MainScreen: navigation.navigate('SearchResults', { query: searchTerm })
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/songs/search?name=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [query]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => navigation.navigate('SongDetail', { song: item })}
    >
      <Text style={styles.songTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results for "{query}"</Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No songs found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 12, textAlign: 'center' },
  songItem: {
    paddingVertical: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  songTitle: { fontSize: 16 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20 },
});