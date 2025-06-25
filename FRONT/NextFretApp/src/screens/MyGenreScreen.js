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
import API_URL from '../config';
import AuthContext from '../contexts/AuthContext';

export default function MyGenresScreen({ navigation }) {
  const { userId } = useContext(AuthContext);

  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`${API_URL}/api/userManager/genres/all`).then(res => res.json()),
      fetch(`${API_URL}/api/userManager/${userId}/genres`).then(res => res.json()),
    ])
      .then(([allGenres, userGenres]) => {
        if (!isMounted) return;

        if (!Array.isArray(userGenres)) {
          console.warn("⚠️ userGenres response is not an array, continuing with empty list:", userGenres);
          userGenres = [];
        }

        const userSet = new Set(userGenres.map(g => g.id));
        const merged = allGenres.map(g => ({
          id: g.id,
          title: g.title,
          liked: userSet.has(g.id),
        }));

        merged.sort((a, b) => {
          if (a.liked === b.liked) return a.title.localeCompare(b.title);
          return a.liked ? -1 : 1;
        });

        setGenres(merged);
      })
      .catch(err => {
        console.error('🔴 Error fetching genres:', err);
        Alert.alert('Error', 'Failed to load genres');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [userId]);

  const handleToggleGenre = useCallback(async (item) => {
    const isLiked = item.liked;

    setGenres(prev =>
      prev.map(g =>
        g.id === item.id ? { ...g, liked: !isLiked } : g
      )
    );

    try {
      const url = `${API_URL}/api/userManager/${userId}/genres${isLiked ? `/${item.id}` : ''}`;
      const options = isLiked
        ? { method: 'DELETE' }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genreId: item.id }),
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

  const filteredGenres = genres.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.genreGridItem,
        { backgroundColor: item.liked ? '#A7C957' : '#F2E8CF' },
      ]}
      onPress={() => handleToggleGenre(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.genreGridText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      

      <TextInput
        style={styles.searchInput}
        placeholder="Search genres..."
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
          data={filteredGenres}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={
            filteredGenres.length === 0 && { flex: 1, justifyContent: 'center' }
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No genres match your search.</Text>
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
  genreGridItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minWidth: 0,
  },
  genreGridText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20 },
});