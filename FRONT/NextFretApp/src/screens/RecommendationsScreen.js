// /src/screens/RecommendationsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import API_URL from '../config';
import AuthContext from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function RecommendationsScreen({ navigation }) {
  const { userId } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userChords, setUserChords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);


  // Like/dislike handlers
  const handleLike = (songId) => {
    // send like request
    fetch(`${API_URL}/api/userManager/${userId}/likes/${songId}`, { method: 'POST' })
      .catch(console.error);
  };
  const handleDislike = (songId) => {
    fetch(`${API_URL}/api/userManager/${userId}/dislikes/${songId}`, { method: 'DELETE' })
      .catch(console.error);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/recommendationEngine/user/${userId}`)
      .then(res => res.json())
      .then(data => setSongs(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetch(`${API_URL}/api/userManager/${userId}/chords`)
      .then(res => res.json())
      .then(data => setUserChords(data.map(c => c.id)))
      .catch(console.error);
  }, [userId]);

  return (
    
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : songs.length > currentIndex ? (
          <GestureHandlerRootView key={currentIndex} style={styles.gestureContainer}>
            <Swipeable
              friction={2}
              overshootFriction={8}
              containerStyle={styles.cardContainer}
              onSwipeableRightOpen={() => { handleDislike(songs[currentIndex].id); setCurrentIndex(currentIndex + 1); }}
              onSwipeableLeftOpen={() => { handleLike(songs[currentIndex].id); setCurrentIndex(currentIndex + 1); }}
              renderRightActions={() => (
                <Animated.View style={[styles.actionCircle, styles.dislikeCircle]}>
                  <Text style={styles.actionText}>✕</Text>
                </Animated.View>
              )}
              renderLeftActions={() => (
                <Animated.View style={[styles.actionCircle, styles.likeCircle]}>
                  <Text style={styles.actionText}>✓</Text>
                </Animated.View>
              )}
            >
              <View style={styles.card}>
                {/* Album artwork placeholder */}
                <View style={styles.imageContainer}>
                  <Image
                    source={require('../../assets/Nirvana.jpg')}
                    style={styles.placeholderImage}
                  />
                </View>
                <View style={styles.titleArtistLeft}>
                  <Text style={styles.cardTitleLeft}>{songs[currentIndex].title}</Text>
                  <Text style={styles.cardArtistLeft}>{songs[currentIndex].artist || 'Unknown Artist'}</Text>
                </View>
                <View style={styles.cardChords}>
                  {(songs[currentIndex].chordList || []).map(c => {
                    const known = userChords.includes(c.id);
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.chordButton,
                          known ? styles.chordButtonKnown : styles.chordButtonUnknown,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.chordButtonText}>{c.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}                     
                    onPress={() => navigation.navigate('SongDetail', { song: songs[currentIndex] })}
                  >
                    <Ionicons name="information-circle-outline" size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => {/* play logic */ }}>
                    <Ionicons name="play" size={24} />
                  </TouchableOpacity>
                </View>
              </View>
            </Swipeable>
          </GestureHandlerRootView>
        ) : (
          <Text style={styles.emptyText}>No more recommendations.</Text>
        )}
      </View>
      
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 12, textAlign: 'center' },
  gestureContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 0, marginTop: -60 },
  cardContainer: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  card: {
    width: 310,
    height: 560,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 3,
    // overflow: 'hidden', // Removed as per instructions
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android shadow
    elevation: 5,
  },
  imageContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: 310,
    resizeMode: 'cover',
  },
  titleArtistLeft: {
    padding: 12,
  },
  cardTitleLeft: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 4,
  },
  cardArtistLeft: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    marginBottom: 8,
  },
  cardChords: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  chordButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chordButtonKnown: { backgroundColor: 'lightgreen' },
  chordButtonUnknown: { backgroundColor: '#ddd' },
  chordButtonText: { fontSize: 14, color: '#000' },
  emptyChords: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  // deleteAction: {
  //   backgroundColor: '#ffdddd',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: 80,
  //   height: '90%',
  //   marginVertical: 10,
  //   borderRadius: 8,
  // },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 300,
    opacity: 0.6,
    marginHorizontal: 16,
  },
  likeCircle: {
    backgroundColor: 'green',
  },
  dislikeCircle: {
    backgroundColor: 'red',
  },
  actionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 2
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
});