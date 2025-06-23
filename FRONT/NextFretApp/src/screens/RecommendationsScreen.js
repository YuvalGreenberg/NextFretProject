// /src/screens/RecommendationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import API_URL from '../config';

export default function RecommendationsScreen({ route }) {
  const { userId } = route.params;
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/recommendationEngine/user/${userId}`)
      .then(res => res.json())
      .then(data => setSongs(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.songItem}>
      <Text style={styles.songTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Recommended Songs</Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No recommendations.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 12, textAlign: 'center' },
  songItem: {
    paddingVertical: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  songTitle: { fontSize: 16 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20 },
});