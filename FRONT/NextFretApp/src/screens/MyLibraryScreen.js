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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function MyLibraryScreen({ navigation }) {
  const { userId } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
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
    }, [userId])
  );

  const filtered = songs.filter(song =>
    song.title.toLowerCase().includes(query.trim().toLowerCase()) ||
    (song.artist || '').toLowerCase().includes(query.trim().toLowerCase())
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
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Song, Artist"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            underlineColorAndroid="transparent"
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#888" />
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        ) : (
          filtered.length > 0
            ? <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
            />
            : <View style={styles.empty}>
              <Text style = {styles.emptyText}>No songs added</Text>
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
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  /*
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    borderRadius: 4,
   // marginTop: -40,
    marginBottom: 8,
  },
  */
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
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
  emptyText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: '#888',
    paddingHorizontal: 16,
    paddingTop: 100,
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
