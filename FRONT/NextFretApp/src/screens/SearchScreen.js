import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API_URL from '../config';

export default function SearchScreen({ navigation }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchTerm.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/recommendationEngine/search?query=${encodeURIComponent(searchTerm)}`);
                const data = await res.json();
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounce = setTimeout(fetchResults, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('SongDetail', { song: item })}
        >
            {/* Left side: artwork */}
            <Image
                source={item.coverUrl ? { uri: item.coverUrl } : require('../../assets/album-place-holder.png')}
                style={styles.itemImage}
                resizeMode="cover"
            />

           

            {/* Center: title and artist */}
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.artist}</Text>
            </View>

            {/* Right side: chord badges */}
            <View style={styles.chordListContainer}>
                {item.chordList?.map(chord => (
                    <View key={chord.id} style={styles.chordBadge}>
                        <Text style={styles.chordBadgeText}>{chord.name}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Song, Artist"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                />
            </View>
            {loading ? (
                <ActivityIndicator style={styles.loader} size="small" />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        searchTerm ? <Text style={styles.emptyText}>No results found</Text> : null
                    }
                    style={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        //marginTop: -40,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    loader: {
        marginTop: 20,
    },
    list: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingRight: 8,
    },
    itemTextContainer: {
        flex: 1,
        paddingRight: 8,
    },
    chordListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: 14,
        color: '#777',
    },
    emptyText: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center', // לא בכל המכשירים תופס
        fontSize: 20,
        fontWeight: '500',
        color: '#888',
        paddingHorizontal: 16,
        paddingTop: 100, // כדי למרכז ויזואלית בגובה
    },
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
    },
});