// src/screens/RecommendationsGridScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import API_URL from '../config';
import AuthContext from '../contexts/AuthContext';

export default function RecommendationsGridScreen({ navigation }) {
  const { userId } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userChords, setUserChords] = useState([]);
  const [maxUnknown, setMaxUnknown] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const param = `?maxUnknown=${maxUnknown}`;
    fetch(`${API_URL}/api/recommendationEngine/user/${userId}${param}`)
      .then(res => res.json())
      .then(songsData => setSongs(songsData))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId, maxUnknown]);

  useEffect(() => {
    fetch(`${API_URL}/api/userManager/${userId}/chords`)
      .then(res => res.json())
      .then(data => setUserChords(data.map(c => c.id)))
      .catch(console.error);
  }, [userId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SongDetail', { song: item })}
    >
      <Image
        source={
          item.coverUrl
            ? { uri: item.coverUrl }
            : require('../../assets/album-place-holder.png')
        }
        style={styles.image}
      />
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.artist} numberOfLines={1}>{item.artist || 'Unknown Artist'}</Text>
      <View style={styles.chordsContainer}>
        {(item.chordList || []).map(c => {
          const known = userChords.includes(c.id);
          return (
            <View
              key={c.id}
              style={[styles.chord, known ? styles.knownChord : styles.unknownChord]}
            >
              <Text style={styles.chordText}>{c.name}</Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );

  const renderFilterToggle = () => (
    <View style={styles.toggleContainer}>
      <View style={{ flexDirection: 'row', position: 'relative', width: '100%' }}>
        <Animated.View style={[styles.animatedHighlight, {
          left: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '50%'],
          }),
        }]} />
        <TouchableOpacity
          style={[styles.toggleOption, { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }]}
          onPress={() => {
            setLoading(true);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start(() => setMaxUnknown(0));
          }}
        >
          <Text style={[styles.toggleText, maxUnknown === 0 && styles.toggleTextSelected]}>Practice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, { borderTopRightRadius: 20, borderBottomRightRadius: 20 }]}
          onPress={() => {
            setLoading(true);
            Animated.timing(slideAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }).start(() => setMaxUnknown(1));
          }}
        >
          <Text style={[styles.toggleText, maxUnknown === 1 && styles.toggleTextSelected]}>Learn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderFilterToggle()}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#555' }}>
            Fetching songs tailored for you...
          </Text>
        </View>
      ) : songs.length === 0 ? (
        <Text style={styles.emptyText}>There are no available songs to practice.</Text>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  filterButtonSelected: {
    backgroundColor: '#81b29a',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 140,
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chord: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 4,
  },
  knownChord: {
    backgroundColor: 'lightgreen',
  },
  unknownChord: {
    backgroundColor: '#ddd',
  },
  chordText: {
    fontSize: 12,
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 250,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  toggleOptionSelected: {
    backgroundColor: '#81b29a',
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  toggleTextSelected: {
    color: '#fff',
  },
  animatedHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#81b29a',
    borderRadius: 20,
  },
});