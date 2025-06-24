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
  StyleSheet
} from 'react-native';  
import API_URL from '../config';
import AuthContext from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MyLibraryScreen({ navigation }) {
  const { userId } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    fetch(`${API_URL}/api/userManager/${userId}/library`)
      .then(res => res.json())
      .then(data => {
        if (isActive && Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
          setSongs(sorted);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => { isActive = false; };
  }, [userId]);

  // Fetch artwork URLs for songs missing coverUrl
  useEffect(() => {
    songs.forEach((song, idx) => {
      if (!song.coverUrl) {
        fetch(`${API_URL}/api/userManager/${userId}/cover/${song.id}`)
          .then(res => {
            if (res.ok) return res.text();
            throw new Error('No cover');
          })
          .then(url => {
            setSongs(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], coverUrl: url };
              return updated;
            });
          })
          .catch(() => {
            // leave placeholder
          });
      }
    });
  }, [songs]);

  const filtered = songs.filter(song =>
    song.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('SongDetail', { song: item })}
    >
      <Image
        source={ item.coverUrl ? { uri: item.coverUrl } : require('../../assets/album-place-holder.png')}
        style={styles.listCover}
      />
      <View style={styles.listTextContainer}>
        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listArtist} numberOfLines={1}>{item.artist || 'Unknown Artist'}</Text>
      </View>
      <TouchableOpacity
        style={styles.listInfoButton}
        onPress={() => navigation.navigate('SongDetail', { song: item })}
      >
        <Ionicons name="information-circle-outline" size={24} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    
      <View style={styles.container}>       
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
            />
            : <View style={styles.empty}>
              <Text>No songs added</Text>
            </View>
        )}

        {/* <FooterMenu navigation={navigation} /> */}
      </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  safeArea: { flex: 1, backgroundColor: '#fff' },
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
    marginTop: -40,
    marginBottom: 8,
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
    flexBasis: '48%',
    alignSelf: 'flex-start',
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
  artist: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- List row styles ---
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  listTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listArtist: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  listInfoButton: {
    padding: 8,
  },
});
