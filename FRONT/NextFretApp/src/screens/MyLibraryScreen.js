// src/screens/MyLibraryScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import FooterMenu from '../components/FooterMenu';
import API_URL from '../config';
import { AuthContext } from '../../App';

export default function MyLibraryScreen({ navigation }) {
  const { userId } = useContext(AuthContext);
  const [songs, setSongs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    fetch(`${API_URL}/api/userManager/${userId}/library`)
      .then(res => res.json())
      .then(data => {
        if (isActive && Array.isArray(data)) {
          setSongs(data);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => { isActive = false; };
  }, [userId]);

  const filtered = songs.filter(song =>
    song.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SongDetail', { songId: item.id })}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.cover} />
      <TouchableOpacity style={styles.heartContainer}>
        <Image
          source={require('../../assets/HeartIcon.png')}
          style={[
            styles.heart,
            { tintColor: item.isFav ? 'red' : 'grey' }
          ]}
        />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Library</Text>

      <TextInput
        style={styles.search}
        placeholder="Search songs…"
        value={query}
        onChangeText={setQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        filtered.length > 0
          ? <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.list}
            />
          : <View style={styles.empty}>
              <Text>No songs added</Text>
            </View>
      )}

      <FooterMenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 80, // keep FooterMenu visible
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  cover: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  heartContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  heart: {
    width: 20,
    height: 20,
  },
  title: {
    marginTop: 8,
    width: 100,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
