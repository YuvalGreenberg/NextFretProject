import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API_URL from '../config';
import { AuthContext } from '../../App';

export default function SongDetailScreen({ route }) {
  // smallSong מגיע מהניווט ומכיל רק id (ואולי כותרת)
  const { song: smallSong } = route.params;
  const { userId } = useContext(AuthContext);
  const songId = smallSong.id;

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(!!smallSong?.isLiked);
  const [userChords, setUserChords] = useState([]);

  // משיכה של הפרטים המלאים מהשרת
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/userManager/${userId}/fullSong/${songId}`)
      .then(res => res.json())
      .then(full => {
        setSong(full);
        setLiked(!!full.isLiked);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [songId, userId]);

  useEffect(() => {
    fetch(`${API_URL}/api/userManager/${userId}/chords`)
      .then(res => res.json())
      .then(data => {
        const ids = Array.isArray(data) ? data.map(chord => chord.id) : [];
        setUserChords(ids);
      })
      .catch(console.error);
  }, [userId]);

  // מצב טעינה
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading song details...</Text>
      </View>
    );
  }
  // אם לא נמצא
  if (!song) {
    return (
      <View style={styles.center}>
        <Text>No song data.</Text>
      </View>
    );
  }

  // טיפול בלחיצה על הלב
  const toggleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    const likeUrl = `${API_URL}/api/userManager/${userId}/${newLiked ? 'likes' : 'dislikes'}/${songId}`;
    fetch(likeUrl, {
      method: newLiked ? 'POST' : 'DELETE'
    })
    .catch(console.error);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.likeButton} onPress={toggleLike}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={28}
          color={liked ? 'red' : 'grey'}
        />
      </TouchableOpacity>

      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.artist}>{song.artist || 'Unknown Artist'}</Text>

      <Text style={styles.sectionHeader}>Chords:</Text>
      <View style={styles.chordList}>
        {song.chordList?.length > 0 ? (
          song.chordList.map(c => {
            const known = userChords.includes(c.id);
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chordButton,
                  known ? styles.chordButtonKnown : styles.chordButtonUnknown
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.chordButtonText}>{c.name}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.chordButtonText}>No chords available.</Text>
        )}
      </View>

      <Text style={styles.sectionHeader}>Lyrics:</Text>
      <Text style={styles.lyrics}>{song.lyrics || 'No lyrics available.'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
  },
  likeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    marginTop: 12,
    fontWeight: '600',
  },
  chordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chordButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chordButtonKnown: {
    backgroundColor: 'lightgreen',
  },
  chordButtonUnknown: {
    backgroundColor: '#ddd',
  },
  chordButtonText: {
    fontSize: 14,
    color: '#000',
  },
  lyrics: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
  },
});